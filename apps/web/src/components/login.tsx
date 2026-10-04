"use client";
import { allowOneTap, googleIdentity } from "../lib/google-one-tap";
import Loading from "./loading";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Layers3, X } from "lucide-react";
import { request, csrfHeaders } from "@hs/api-client";
import { completeGoogleSignIn, googleSignInError, prepareGoogleSignIn, type GoogleSignInClient } from "../lib/google-sign-in";
export default function Login({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mounted = useRef(false);
  const submitting = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const [client, setClient] = useState<GoogleSignInClient | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState("");
  const configured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const element = dialog.current;
    googleIdentity()?.cancel();
    window.dispatchEvent(new CustomEvent("hs-login-visible", {detail:true}));
    mounted.current = true;
    element?.showModal();
    return () => {
      window.dispatchEvent(new CustomEvent("hs-login-visible", {detail:false}));
      mounted.current = false;
      controller.current?.abort();
      element?.close();
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    if (!configured) return;
    let live = true;
    prepareGoogleSignIn().then((value) => { if (live) setClient(value); }).catch(() => {
      if (live) setError("Chưa chuẩn bị được đăng nhập Google. Kiểm tra kết nối rồi thử lại.");
    });
    return () => { live = false; };
  }, [configured, attempt]);
  function close() {
    if (exchanging) return;
    mounted.current = false;
    controller.current?.abort();
    onClose();
  }
  async function signIn() {
    if (!client || submitting.current) return;
    allowOneTap();
    submitting.current = true;
    setBusy(true);
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    try {
      const completed = await completeGoogleSignIn(client, {
        isActive: () => mounted.current && !abort.signal.aborted,
        csrf: () => request("/auth/csrf", { signal: abort.signal }),
        exchange: (idToken) => {
          setExchanging(true);
          return request("/auth/session", { method: "POST", headers: csrfHeaders(), body: JSON.stringify({ idToken }), signal: abort.signal });
        },
      });
      if (completed && mounted.current) { onSuccess(); onClose(); }
    } catch (cause) {
      if (mounted.current) setError(googleSignInError(cause));
    } finally {
      submitting.current = false;
      if (mounted.current) { setBusy(false); setExchanging(false); }
    }
  }
  return (
    <dialog ref={dialog} className="login-dialog" aria-labelledby="login-title" aria-describedby="login-description" onCancel={(event) => { event.preventDefault(); close(); }}>
      <div className="dialog-top"><span className="login-emblem"><Layers3 size={24} aria-hidden="true" /></span><button aria-label="Đóng đăng nhập" title="Đóng đăng nhập" disabled={exchanging} onClick={close}><X size={20} aria-hidden="true" /></button></div>
      <p className="eyebrow">KHÔNG GIAN CÁ NHÂN</p>
      <h2 id="login-title">Tiếp tục với HumanScope</h2>
      <p id="login-description">Đăng nhập bằng tài khoản Google để lưu ghi chú riêng và soạn bài.</p>
      {configured ? <>
        <button className="google-sign-in" disabled={!client || busy} onClick={signIn}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59C7.19 7.72 9.4 5.96 12 5.96Z"/></svg>
          {busy ? <Loading inline label={exchanging ? "Đang hoàn tất đăng nhập" : "Đang chờ Google"} /> : client ? "Đăng nhập bằng Google" : error ? "Đăng nhập chưa sẵn sàng" : <Loading inline label="Đang chuẩn bị đăng nhập" />}
        </button>
        <div role="status" className="login-status">{busy && !exchanging ? "Chọn tài khoản trong cửa sổ Google để tiếp tục." : exchanging ? "Đang tạo phiên đăng nhập. Cửa sổ này sẽ tự đóng khi hoàn tất." : ""}</div>
        {error && <p role="alert" className="login-error">{error}</p>}
        {error && !client && <button onClick={() => { setError(""); setAttempt((n) => n + 1); }}>Thử lại</button>}
      </> : <div className="notice">Đăng nhập chưa được mở. Bạn có thể tiếp tục xem nội dung công khai.</div>}
      <div className="login-public"><p>Khám phá nội dung công khai không cần tài khoản.</p><button className="text-button" disabled={exchanging} onClick={close}>Tiếp tục khám phá <ArrowRight size={16} aria-hidden="true" /></button></div>
    </dialog>
  );
}
