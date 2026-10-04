'use client';
import Loading from '../loading';
import { suppressOneTap } from "../../lib/google-one-tap";
import { useEffect, useRef, useState } from 'react';
import { ApiError, csrfHeaders, request } from '@hs/api-client';
import { completeGoogleSignIn, prepareGoogleSignIn, type GoogleSignInClient } from '../../lib/google-sign-in';
import { AccountDialog, useAccount } from './account-shell';

export default function RevokeSessions() {
  const { account, expired } = useAccount();
  const [open, setOpen] = useState(false);
  const available = account.googleLinked && !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return <><div className="footer-actions"><button disabled={!available} onClick={() => setOpen(true)}>Đăng xuất tất cả phiên</button></div>{!available && <p className="inline-message">Đăng xuất tất cả phiên chưa khả dụng. Bạn vẫn có thể đăng xuất phiên hiện tại.</p>}{open && <RevokeDialog onClose={() => setOpen(false)} onRevoked={() => { suppressOneTap(); setOpen(false); expired(); window.dispatchEvent(new Event('hs-auth-changed')); }} />}</>;
}
function RevokeDialog({ onClose, onRevoked }: { onClose: () => void; onRevoked: () => void }) {
  const [client, setClient] = useState<GoogleSignInClient | null>(null);
  const [busy, setBusy] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const active = useRef(true);
  const submitting = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    let live = true;
    void prepareGoogleSignIn().then(value => { if (live) setClient(value); }).catch(() => { if (live) setMessage('Chưa kết nối được Google để xác minh. Bạn có thể thử lại.'); });
    return () => { live = false; };
  }, [attempt]);
  async function revoke() {
    if (!client || submitting.current) return;
    submitting.current = true; setBusy(true); setMessage('');
    try {
      const completed = await completeGoogleSignIn(client, {
        isActive: () => active.current,
        csrf: () => request('/auth/csrf'),
        exchange: idToken => {
          setExchanging(true);
          return request('/auth/revoke-all', { method: 'POST', headers: csrfHeaders(), body: JSON.stringify({ idToken }) });
        },
      });
      if (completed && active.current) onRevoked();
    } catch (error) {
      if (!active.current) return;
      if (error instanceof ApiError && error.status === 401) { onRevoked(); return; }
      setMessage(error instanceof ApiError && error.code === 'IDENTITY_MISMATCH' ? 'Bạn đã chọn tài khoản Google khác. Chọn đúng tài khoản đang dùng trên HumanScope.' : 'Chưa xác nhận được việc đăng xuất tất cả phiên. Hãy thử lại hoặc tải lại trang để kiểm tra phiên hiện tại.');
    } finally { submitting.current = false; if (active.current) { setBusy(false); setExchanging(false); } }
  }
  function close() { if (!exchanging) { active.current = false; onClose(); } }
  return <AccountDialog title="Đăng xuất tất cả phiên?" onClose={close}><p>Các phiên HumanScope, gồm phiên hiện tại, sẽ hết hiệu lực. Xác minh lại bằng đúng tài khoản Google để tiếp tục; dữ liệu đã lưu vẫn được giữ.</p>{message && <p className="account-message" role="alert">{message}</p>}<p className="inline-message" role={exchanging || (!client && !message) ? undefined : "status"}>{busy ? exchanging ? <Loading inline label="Đang kết thúc các phiên đăng nhập"/> : 'Chọn tài khoản trong cửa sổ Google để xác minh.' : !client && !message ? <Loading inline label="Đang chuẩn bị xác minh"/> : ''}</p><div className="actions"><button disabled={exchanging} onClick={close}>Hủy</button>{message && !client ? <button onClick={() => { setMessage(''); setAttempt(value => value + 1); }}>Thử lại</button> : <button className="primary" disabled={!client || busy} onClick={() => void revoke()}>Xác minh & đăng xuất</button>}</div></AccountDialog>;
}
