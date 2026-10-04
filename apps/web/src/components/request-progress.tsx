'use client';
import { useEffect, useState, useSyncExternalStore, useTransition, useMemo } from 'react';
import { beginRequest, getPendingRequests, getServerPendingRequests, subscribeRequests } from '@hs/api-client';
import { useLinkStatus } from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './loading.module.css';

export function PendingBoundary() {
 useEffect(() => beginRequest(), []);
 return null;
}
// Next owns transition completion/cancellation; no guessed navigation timer.
export function LinkPending() {
 const { pending } = useLinkStatus();
 return pending ? <PendingBoundary/> : null;
}
export function useProgressRouter() {
 const router = useRouter();
 const [pending, startTransition] = useTransition();
 useEffect(() => { if (pending) return beginRequest(); }, [pending]);
 return useMemo(() => ({
  ...router,
  push: (...args: Parameters<typeof router.push>) => startTransition(() => router.push(...args)),
  replace: (...args: Parameters<typeof router.replace>) => startTransition(() => router.replace(...args)),
  refresh: () => startTransition(() => router.refresh()),
 }), [router, startTransition]);
}
export default function RequestProgress() {
 const pending = useSyncExternalStore(subscribeRequests, getPendingRequests, getServerPendingRequests);
 const [visible, setVisible] = useState(false);
 useEffect(() => { if (!pending) return; const timer = setTimeout(() => setVisible(true), 180); return () => { clearTimeout(timer); setVisible(false); }; }, [pending > 0]);
 if (!pending || !visible) return null;
 return <div className={styles.topProgress} role="progressbar" aria-label="Đang tải hoặc xử lý yêu cầu"><span/></div>;
}
