import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { createVerifiedBodyReader } from '../packages/anatomy-viewer/src/verified-body-asset';
import { beginRequest, getPendingRequests, subscribeRequests } from '../packages/api-client/src/request-activity';
import { request } from '../packages/api-client/src/index';
const bytes = new Uint8Array([1,2,3]);
const expected = { byteLength: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
const signal = () => new AbortController().signal;
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('bounded verified byte cache', () => {
 it('reuses verified bytes without sharing caller mutation', async () => {
  const fetch = vi.fn(async () => new Response(bytes)); vi.stubGlobal('fetch', fetch); const cache = createVerifiedBodyReader();
  const first = await cache.read('/asset', expected, signal()); first[0] = 99;
  const progress = vi.fn(); expect(await cache.read('/asset', expected, signal(), progress)).toEqual(bytes);
  expect(fetch).toHaveBeenCalledTimes(1); expect(progress).toHaveBeenLastCalledWith(3,3); expect(cache.stats()).toEqual({bytes:3,entries:1,pending:0});
 });
 it('expires and evicts by total byte size', async () => {
  let now=0; const fetch=vi.fn(async()=>new Response(bytes)); vi.stubGlobal('fetch',fetch);
  const cache=createVerifiedBodyReader({maxBytes:6,ttlMs:10,now:()=>now});
  for(const url of ['/one','/two','/three'])await cache.read(url,expected,signal());
  expect(cache.stats().bytes).toBe(6);await cache.read('/one',expected,signal());expect(fetch).toHaveBeenCalledTimes(4);
  now=11;expect(cache.stats().entries).toBe(0);await cache.read('/one',expected,signal());expect(fetch).toHaveBeenCalledTimes(5);
 });
 it('promotes a cache hit before evicting the least recently used entry',async()=>{
  const fetch=vi.fn(async()=>new Response(bytes));vi.stubGlobal('fetch',fetch);const cache=createVerifiedBodyReader({maxBytes:6});
  for(const url of ['/a','/b','/a','/c','/a'])await cache.read(url,expected,signal());
  expect(fetch).toHaveBeenCalledTimes(3);await cache.read('/b',expected,signal());expect(fetch).toHaveBeenCalledTimes(4);
 });
 it('times out a shared model fetch and clears every subscriber',async()=>{
  vi.useFakeTimers();vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))))));
  const cache=createVerifiedBodyReader();const a=cache.read('/a',expected,signal()).catch(e=>e.message),b=cache.read('/a',expected,signal()).catch(e=>e.message);
  await vi.advanceTimersByTimeAsync(45001);expect(await Promise.all([a,b])).toEqual(['aborted','aborted']);expect(cache.stats()).toEqual({bytes:0,entries:0,pending:0});
 });
 it('does not cache data larger than the budget',async()=>{
  vi.stubGlobal('fetch',vi.fn(async()=>new Response(bytes)));const cache=createVerifiedBodyReader({maxBytes:2});await cache.read('/a',expected,signal());expect(cache.stats().bytes).toBe(0);
 });
 it('shares transport while cancelling only the departing subscriber',async()=>{
  let release!:(response:Response)=>void;let sharedSignal!:AbortSignal;
  const fetch=vi.fn((_url,options)=>{sharedSignal=options.signal;return new Promise<Response>(resolve=>{release=resolve;});});vi.stubGlobal('fetch',fetch);
  const cache=createVerifiedBodyReader(),a=new AbortController(),b=new AbortController();
  const first=cache.read('/a',expected,a.signal).catch(e=>e.message);const second=cache.read('/a',expected,b.signal);
  a.abort();expect(sharedSignal.aborted).toBe(false);release(new Response(bytes));expect(await first).toBe('Cancelled');expect(await second).toEqual(bytes);expect(fetch).toHaveBeenCalledTimes(1);
 });
 it('aborts abandoned transport and does not retain its late result',async()=>{
  let release!:(response:Response)=>void;let sharedSignal!:AbortSignal;vi.stubGlobal('fetch',vi.fn((_url,options)=>{sharedSignal=options.signal;return new Promise<Response>(resolve=>{release=resolve;});}));
  const cache=createVerifiedBodyReader(),a=new AbortController();const first=cache.read('/a',expected,a.signal).catch(e=>e.message);a.abort();expect(sharedSignal.aborted).toBe(true);release(new Response(bytes));await first;await new Promise(resolve=>setTimeout(resolve,0));expect(cache.stats()).toEqual({bytes:0,entries:0,pending:0});
 });
 it('rejects bad data and retries rather than caching failure',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(new Response(new Uint8Array([9,9,9]))).mockResolvedValueOnce(new Response(bytes));vi.stubGlobal('fetch',fetch);const cache=createVerifiedBodyReader();
  await expect(cache.read('/a',expected,signal())).rejects.toThrow('Integrity');expect(cache.stats().entries).toBe(0);expect(await cache.read('/a',expected,signal())).toEqual(bytes);expect(fetch).toHaveBeenCalledTimes(2);
 });
 it('invalidates on manifest hash change even at the same URL',async()=>{
  const changed=new Uint8Array([4,5,6]);const fetch=vi.fn().mockResolvedValueOnce(new Response(bytes)).mockResolvedValueOnce(new Response(changed));vi.stubGlobal('fetch',fetch);const cache=createVerifiedBodyReader();await cache.read('/a',expected,signal());
  expect(await cache.read('/a',{byteLength:3,sha256:createHash('sha256').update(changed).digest('hex')},signal())).toEqual(changed);expect(fetch).toHaveBeenCalledTimes(2);
 });
 it('cancels before cache lookup and isolates faulty feedback listeners',async()=>{
  const fetch=vi.fn(async()=>new Response(bytes));vi.stubGlobal('fetch',fetch);const cache=createVerifiedBodyReader();await cache.read('/a',expected,signal(),()=>{throw Error('UI');});const abort=new AbortController();abort.abort();await expect(cache.read('/a',expected,abort.signal)).rejects.toThrow('Cancelled');expect(fetch).toHaveBeenCalledTimes(1);
 });
});
describe('pending request feedback without response caching',()=>{
 it('counts concurrent work and idempotently settles',()=>{
  vi.stubGlobal('window',{});const listener=vi.fn(),unsubscribe=subscribeRequests(listener);const a=beginRequest(),b=beginRequest();expect(getPendingRequests()).toBe(2);a();a();expect(getPendingRequests()).toBe(1);b();expect(getPendingRequests()).toBe(0);unsubscribe();expect(listener).toHaveBeenCalledTimes(4);
 });
 it('does not share server pending state',()=>{const done=beginRequest();expect(getPendingRequests()).toBe(0);done();});
 it('settles HTTP and parse failures and never caches private reads',async()=>{
  vi.stubGlobal('window',{});const fetch=vi.fn().mockResolvedValueOnce(new Response('bad-json')).mockResolvedValueOnce(new Response('{}',{status:403}));vi.stubGlobal('fetch',fetch);
  await expect(request('/api/v1/me')).rejects.toThrow();expect(getPendingRequests()).toBe(0);await expect(request('/api/v1/me')).rejects.toThrow();expect(getPendingRequests()).toBe(0);expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls.every(([,options])=>options.cache==='no-store'&&options.credentials==='same-origin')).toBe(true);
 });
 it('settles explicit cancellation without clearing another pending operation',async()=>{
  vi.stubGlobal('window',{});const abort=new AbortController();vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))))));
  const endOther=beginRequest(),pending=request('/api/v1/me',{signal:abort.signal}).catch(e=>e.message);abort.abort();expect(await pending).toBe('aborted');expect(getPendingRequests()).toBe(1);endOther();expect(getPendingRequests()).toBe(0);
 });
 it('settles timed out requests and removes cancelled work',async()=>{
  vi.stubGlobal('window',{});vi.useFakeTimers();vi.stubGlobal('fetch',vi.fn((_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted'))))));
  const pending=request('/api/v1/me').catch(e=>e.message);expect(getPendingRequests()).toBe(1);await vi.advanceTimersByTimeAsync(10001);expect(await pending).toBe('aborted');expect(getPendingRequests()).toBe(0);
 });
});
