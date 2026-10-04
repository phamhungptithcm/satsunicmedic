// Contains counts only. Never retain endpoint, identity or response data.
let pending = 0;
const listeners = new Set<() => void>();
export const getPendingRequests = () => pending;
export const getServerPendingRequests = () => 0;
export function subscribeRequests(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function beginRequest() {
 if (typeof window === 'undefined') return () => {};
 pending++; listeners.forEach(listener => { try { listener(); } catch { /* Feedback does not alter network requests. */ } }); let settled = false;
 return () => { if (settled) return; settled = true; pending--; listeners.forEach(listener => { try { listener(); } catch { /* Feedback does not alter network requests. */ } }); };
}
