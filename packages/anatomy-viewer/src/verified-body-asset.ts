export type ByteProgress = (loaded: number, total: number) => void;
type Expected = { byteLength: number; sha256: string };
type Subscriber = { resolve: (bytes: Uint8Array<ArrayBuffer>) => void; reject: (error: Error) => void; signal: AbortSignal; cancel: () => void; progress?: ByteProgress };
type Flight = { controller: AbortController; subscribers: Set<Subscriber>; loaded: number; total: number };
const cancelled = () => new Error('Cancelled');
const report = (listener: ByteProgress | undefined, loaded: number, total: number) => { try { listener?.(loaded, total); } catch { /* Feedback cannot change download ownership. */ } };

/** Cache verified bytes only, never mutable THREE objects or user data. */
export function createVerifiedBodyReader({ maxBytes = 32 * 1024 * 1024, ttlMs = 300_000, now = Date.now } = {}) {
 const cache = new Map<string, { bytes: Uint8Array<ArrayBuffer>; expires: number }>();
 const flights = new Map<string, Flight>(); let size = 0;
 const evict = (key: string) => { const entry = cache.get(key); if (entry) { size -= entry.bytes.byteLength; cache.delete(key); } };
 const prune = () => { for (const [key, entry] of cache) if (entry.expires <= now()) evict(key); };
 async function download(url: string, expected: Expected, flight: Flight) {
  const signal = flight.controller.signal;
  const response = await fetch(url, { signal, cache: 'no-store' });
  if (!response.ok || !response.body) throw Error('Unavailable');
  const bytes = new Uint8Array(expected.byteLength), reader = response.body.getReader(); let offset = 0;
  try {
   while (true) {
    if (signal.aborted) throw cancelled();
    const part = await reader.read(); if (part.done) break;
    if (offset + part.value.length > bytes.length) throw Error('Oversize');
    bytes.set(part.value, offset); offset += part.value.length; flight.loaded = offset;
    for (const subscriber of flight.subscribers) report(subscriber.progress, offset, bytes.length);
   }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  if (signal.aborted) throw cancelled();
  if (offset !== bytes.length) throw Error('Incomplete');
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (digest !== expected.sha256 || signal.aborted) throw Error('Integrity/cancelled');
  return bytes;
 }
 function read(url: string, expected: Expected, signal: AbortSignal, progress?: ByteProgress): Promise<Uint8Array<ArrayBuffer>> {
  if (!Number.isSafeInteger(expected.byteLength) || expected.byteLength <= 0 || expected.byteLength > 8_000_000 || !/^[a-f0-9]{64}$/.test(expected.sha256)) return Promise.reject(Error('Manifest'));
  if (signal.aborted) return Promise.reject(cancelled());
  prune();
  const key = JSON.stringify([url, expected.byteLength, expected.sha256]), cached = cache.get(key);
  if (cached) { cache.delete(key); cache.set(key, cached); report(progress, expected.byteLength, expected.byteLength); return signal.aborted ? Promise.reject(cancelled()) : Promise.resolve(cached.bytes.slice()); }
  let flight = flights.get(key), start = false;
  if (!flight) { flight = { controller: new AbortController(), subscribers: new Set(), loaded: 0, total: expected.byteLength }; flights.set(key, flight); start = true; }
  const current = flight;
  const result = new Promise<Uint8Array<ArrayBuffer>>((resolve, reject) => {
   const subscriber: Subscriber = { resolve, reject, signal, progress, cancel: () => {
    current.subscribers.delete(subscriber); signal.removeEventListener('abort', subscriber.cancel); reject(cancelled());
    if (!current.subscribers.size) { current.controller.abort(); if (flights.get(key) === current) flights.delete(key); }
   } };
   current.subscribers.add(subscriber); signal.addEventListener('abort', subscriber.cancel, { once: true });
   report(progress, current.loaded, current.total);
  });
  if (start) {
   const timer = setTimeout(() => current.controller.abort(), 45_000);
   const finish = (bytes?: Uint8Array<ArrayBuffer>, error?: Error) => {
    clearTimeout(timer); if (flights.get(key) === current) flights.delete(key);
    for (const subscriber of current.subscribers) { subscriber.signal.removeEventListener('abort', subscriber.cancel); if (error) subscriber.reject(error); else subscriber.resolve(bytes!.slice()); }
    current.subscribers.clear();
   };
   void download(url, expected, current).then(bytes => {
    if (current.controller.signal.aborted || !current.subscribers.size) { finish(undefined, cancelled()); return; }
    if (bytes.byteLength <= maxBytes) { prune(); while (size + bytes.byteLength > maxBytes && cache.size) evict(cache.keys().next().value!); cache.set(key, { bytes, expires: now() + ttlMs }); size += bytes.byteLength; }
    finish(bytes);
   }, error => finish(undefined, error instanceof Error ? error : Error('Unavailable')));
  }
  return result;
 }
 return { read, stats: () => { prune(); return { bytes: size, entries: cache.size, pending: flights.size }; } };
}
// Server callers do not retain model bytes or state across users/requests.
const browserReader = createVerifiedBodyReader({ maxBytes: typeof window === 'undefined' ? 0 : 32 * 1024 * 1024 });
export const readVerifiedBodyBytes = browserReader.read;
