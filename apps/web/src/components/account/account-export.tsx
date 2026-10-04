'use client';
import { useEffect, useRef, useState } from 'react';
import { ApiError, csrfHeaders, request } from '@hs/api-client';
import { completeGoogleSignIn, prepareGoogleSignIn, type GoogleSignInClient } from '../../lib/google-sign-in';
import { AccountDialog, useAccount } from './account-shell';
import { collectPersonalExport, type ExportPage } from '../../lib/personal-export';

export default function AccountExport() {
  const { account } = useAccount();
  const [open, setOpen] = useState(false);
  const available = account.capabilities.export && account.googleLinked && !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return <><p>Tải hồ sơ, ghi chú, bài giảng, cảnh đã lưu và lịch sử học tập dưới dạng JSON. File chứa dữ liệu riêng tư; hãy lưu ở nơi an toàn.</p><p>Ảnh chụp dữ liệu được đọc từng phần. Tránh chỉnh sửa dữ liệu ở cửa sổ khác trong lúc tải.</p><button disabled={!available} onClick={() => setOpen(true)}>Tải dữ liệu cá nhân</button>{!available && <p>Đăng nhập Google cần được cấu hình để xác minh trước khi xuất dữ liệu.</p>}{open && <ExportDialog close={() => setOpen(false)} />}</>;
}
function ExportDialog({ close }: { close: () => void }) {
  const { account } = useAccount();
  const [client, setClient] = useState<GoogleSignInClient | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);
  const active = useRef(true);
  const pending = useRef<AbortController | null>(null);
  const submitting = useRef(false);
  useEffect(() => {
    active.current = true;
    void prepareGoogleSignIn().then(value => { if (active.current) setClient(value); }).catch(() => { if (active.current) setMessage('Chưa kết nối được Google. Hãy thử lại.'); });
    const cancel = () => { active.current = false; pending.current?.abort(); close(); };
    window.addEventListener('hs-auth-changed', cancel);
    return () => { active.current = false; pending.current?.abort(); window.removeEventListener('hs-auth-changed', cancel); };
  }, [attempt, close]);
  async function download() {
    if (!client || submitting.current) return;
    submitting.current = true; setBusy(true); setMessage('Chọn đúng tài khoản Google để xác minh.');
    const controller = new AbortController(); pending.current = controller;
    try {
      await completeGoogleSignIn(client, {
        isActive: () => active.current && !controller.signal.aborted,
        csrf: () => request('/auth/csrf', { signal: controller.signal }),
        exchange: async idToken => {
          const result = await collectPersonalExport(
            { displayName: account.displayName, email: account.email, studyRole: account.studyRole, timezone: account.timezone, reducedMotion: account.reducedMotion },
            (kind, cursor, lessonId) => request<ExportPage>('/api/v1/me/account/export', { method: 'POST', headers: csrfHeaders(), signal: controller.signal, body: JSON.stringify({ idToken, kind, cursor, lessonId }) }),
            controller.signal,
            records => setMessage(`Đang chuẩn bị file: ${records} mục đã đọc…`),
          );
          if (controller.signal.aborted || !active.current) return;
          const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], {type:'application/json'}));
          const link = document.createElement('a'); link.href=url;link.download='humanscope-du-lieu-ca-nhan.json';document.body.append(link);link.click();link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setMessage('Đã gửi file tới trình duyệt. Kiểm tra thư mục tải xuống của bạn.');
        },
      });
    } catch (error) {
      if (active.current && !controller.signal.aborted) setMessage(error instanceof Error && (error.message === 'EXPORT_CAPACITY_EXCEEDED' || error instanceof ApiError && error.code === 'EXPORT_CAPACITY_EXCEEDED') ? 'Dữ liệu vượt giới hạn của một lần tải. Chưa tạo file; dữ liệu của bạn vẫn được giữ.' : error instanceof ApiError && error.code === 'IDENTITY_MISMATCH' ? 'Chọn đúng tài khoản Google đang dùng trên HumanScope.' : 'Chưa tạo được file dữ liệu. Bạn có thể xác minh và thử lại.');
    } finally { submitting.current=false;if (active.current) setBusy(false); }
  }
  return <AccountDialog title="Tải dữ liệu cá nhân" onClose={() => { pending.current?.abort(); close(); }}><p>Xác minh lại bằng Google trước khi đọc dữ liệu. Bạn có thể hủy; file chưa hoàn chỉnh sẽ không được tải.</p><p role="status">{message}</p><div className="actions"><button onClick={() => { pending.current?.abort(); close(); }}>Đóng</button>{!client && message ? <button onClick={() => { setMessage(''); setAttempt(value=>value+1); }}>Thử lại</button> : <button disabled={!client || busy} onClick={() => void download()}>{busy ? 'Đang chuẩn bị…' : 'Xác minh & tải dữ liệu'}</button>}</div></AccountDialog>;
}
