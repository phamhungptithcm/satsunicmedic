'use client';
import { suppressOneTap } from "../../lib/google-one-tap";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, HelpCircle, House, Layers3, LockKeyhole, LogOut, Settings2, ShieldCheck, Sparkles, UserRound, X } from 'lucide-react';
import { request, csrfHeaders, ApiError } from '@hs/api-client';
import type { AccountSettings, AccountView } from '@hs/contracts';
import Login from '../login';
import { useSiteShell } from '../site-shell';
import Loading from '../loading';
import { accountName, accountPath, accountSections, initials } from '../../lib/account';
import styles from './account.module.css';

type AccountContextValue = { account: AccountView; save: (settings: AccountSettings, revision: number) => Promise<void>; reload: () => void; setDirty: (dirty: boolean) => void; expired: () => void };
const AccountContext = createContext<AccountContextValue | null>(null);
export function useAccount() { const value = useContext(AccountContext); if (!value) throw new Error('Account context required'); return value; }
const icons = { home: House, user: UserRound, shield: ShieldCheck, settings: Settings2, star: Sparkles, card: CreditCard, lock: LockKeyhole, help: HelpCircle };

export function AccountDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const previous = document.activeElement as HTMLElement | null; const dialog = ref.current; dialog?.showModal(); return () => { dialog?.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} aria-labelledby="account-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}><button type="button" className="quiet close" aria-label="Đóng hộp thoại" onClick={onClose}><X size={18} /></button><h2 id="account-dialog-title">{title}</h2>{children}</dialog>;
}

export default function AccountShell({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<AccountView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'guest' | 'error'>('loading');
  const [login, setLogin] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: 'navigate'; path: string } | { kind: 'logout' } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const main = useRef<HTMLElement>(null);
  const mounted = useRef(false);
  const fetchAbort = useRef<AbortController | null>(null);
  const expire = useCallback(() => { setAccount(null); setStatus('guest'); setDirty(false); }, []);
  const reload = useCallback(() => {
    fetchAbort.current?.abort();
    const controller = new AbortController(); fetchAbort.current = controller;
    setStatus('loading'); setMessage('');
    void request<AccountView>('/api/v1/me/account', { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) { setAccount(data); setStatus('ready'); }
    }).catch(error => {
      if (controller.signal.aborted) return;
      setAccount(null); setStatus(error instanceof ApiError && error.status === 401 ? 'guest' : 'error');
    });
  }, []);
  useEffect(() => { mounted.current = true; reload(); window.addEventListener('hs-auth-changed', reload); return () => { window.removeEventListener('hs-auth-changed', reload); mounted.current = false; fetchAbort.current?.abort(); }; }, [reload]);
  useEffect(() => {
    const prevent = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', prevent);
    return () => window.removeEventListener('beforeunload', prevent);
  }, [dirty]);
  useEffect(() => { main.current?.focus({ preventScroll: true }); }, [pathname, status]);
  const save = useCallback(async (settings: AccountSettings, revision: number) => {
    try {
      await request('/auth/csrf');
      const updated = await request<AccountSettings & { revision: number }>('/api/v1/me/account', { method: 'PATCH', headers: csrfHeaders(), body: JSON.stringify({ ...settings, revision }) });
      if (mounted.current) { setAccount(current => current ? { ...current, ...updated } : null); setDirty(false); }
    } catch (error) { if (error instanceof ApiError && error.status === 401 && mounted.current) expire(); throw error; }
  }, [expire]);
  function navigate(path: string) { if (dirty) setConfirm({ kind: 'navigate', path }); else router.push(path); }
  const guardNavigation = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!dirty || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = (event.target as Element).closest('a');
    if (!target || target.target === '_blank') return;
    const url = new URL(target.href, window.location.href);
    if (url.origin === window.location.origin && url.pathname !== pathname) { event.preventDefault(); event.stopPropagation(); setConfirm({ kind: 'navigate', path: url.pathname + url.search + url.hash }); }
  }, [dirty, pathname]);
  const openLogin = useCallback(() => setLogin(true), []);
  useSiteShell({ authenticated: status === 'ready', onLogin: openLogin, guardNavigation });
  async function logout() {
    if (busy) return;
    setBusy(true); setMessage('');
    try { await request('/auth/csrf'); await request('/auth/session', { method: 'DELETE', headers: csrfHeaders() }); suppressOneTap(); if (mounted.current) { expire(); setConfirm(null); window.dispatchEvent(new Event('hs-auth-changed')); } }
    catch { if (mounted.current) setMessage('Chưa đăng xuất được. Bạn vẫn đang trong phiên hiện tại; hãy thử lại.'); }
    finally { if (mounted.current) setBusy(false); }
  }
  const name = account ? accountName(account) : 'Tài khoản';
  const slug = pathname.split('/')[2] ?? '';
  const selected = ['nang-cap', 'ket-qua'].includes(slug) ? 'goi' : slug === 'xoa' ? 'du-lieu' : slug;
  return <div><div className={`${styles.root} ${account?.reducedMotion ? 'reduced-motion' : ''}`}>

    <div className="workspace"><aside className="sidebar"><Link href="/tai-khoan/ho-so" className="sidebar-identity"><span className="avatar small">{account ? initials(account.displayName) : 'HS'}</span><span><strong>{name}</strong><small>Tài khoản cá nhân</small></span></Link><nav aria-label="Quản lý tài khoản">{accountSections.map(item => { const Icon = icons[item.icon]; return <div key={item.slug}>{'group' in item && <span className="nav-group">{item.group}</span>}<Link href={accountPath(item.slug)} aria-current={selected === item.slug ? 'page' : undefined}><Icon aria-hidden="true" /><span>{item.label}</span></Link></div>; })}</nav><div className="mobile-account-nav"><label htmlFor="account-navigation">Quản lý tài khoản</label><div><select id="account-navigation" value={selected} onChange={event => navigate(accountPath(event.target.value))}>{accountSections.map(item => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select>{account && <button className="quiet" onClick={() => setConfirm({ kind: 'logout' })}>Đăng xuất</button>}</div></div><div className="sidebar-bottom"><div className="plan-mini"><span>{account ? 'HumanScope Free' : 'HumanScope'}</span><Link href="/tai-khoan/goi">Xem gói của bạn <ArrowRight size={12} /></Link></div>{account && <button className="quiet logout" onClick={() => setConfirm({ kind: 'logout' })}>Đăng xuất <LogOut size={15} /></button>}</div></aside>
    <main id="main" ref={main} tabIndex={-1}>
      {status === 'loading' && <div className="account-loading"><Loading label="Đang tải tài khoản" /><p>Đang xác nhận phiên đăng nhập của bạn.</p></div>}
      {status === 'guest' && <section className="auth-box"><span className="brand-mark"><Layers3 /></span><h1>Không gian của bạn</h1><p>Đăng nhập để quản lý tài khoản, lưu ghi chú và tiếp tục việc học.</p><button className="primary" onClick={() => setLogin(true)}>Đăng nhập bằng Google</button><p className="small-text">Nếu phiên trước đã kết thúc, đăng nhập lại bằng đúng tài khoản bạn đã sử dụng.</p><div className="rule" /><Link className="text-link" href="/">Tiếp tục khám phá không cần tài khoản</Link></section>}
      {status === 'error' && <section className="panel empty"><h1>Chưa tải được tài khoản</h1><p>Không thể xác minh thông tin lúc này. Kiểm tra kết nối rồi thử lại; lỗi tải không có nghĩa dữ liệu đã mất.</p><button className="primary" onClick={reload}>Thử lại</button></section>}
      {status === 'ready' && account && <AccountContext.Provider value={{ account, save, reload, setDirty, expired: expire }}>{children}</AccountContext.Provider>}
    </main></div>
    {login && <Login onClose={() => setLogin(false)} onSuccess={() => { reload(); window.dispatchEvent(new Event('hs-auth-changed')); }} />}
    {confirm && <AccountDialog title={confirm.kind === 'logout' ? 'Đăng xuất HumanScope?' : 'Bạn có thay đổi chưa lưu'} onClose={() => { if (!busy) { setConfirm(null); setMessage(''); } }}><p>{confirm.kind === 'logout' ? `Bạn cần đăng nhập lại để mở dữ liệu riêng.${dirty ? ' Thay đổi chưa lưu sẽ bị bỏ.' : ''}` : 'Ở lại để lưu hoặc bỏ thay đổi trước khi chuyển trang.'}</p>{message && <p role="alert">{message}</p>}<div className="actions"><button disabled={busy} onClick={() => setConfirm(null)}>Ở lại</button><button disabled={busy} className="primary" onClick={() => { if (confirm.kind === 'logout') void logout(); else { setDirty(false); const path = confirm.path; setConfirm(null); router.push(path); } }}>{busy ? 'Đang đăng xuất…' : confirm.kind === 'logout' ? 'Đăng xuất' : 'Bỏ thay đổi'}</button></div></AccountDialog>}
  </div></div>;
}
