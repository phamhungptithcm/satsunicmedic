"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, Box, GraduationCap, Hospital, Info, Menu, UserRound, X } from "lucide-react";
import { request } from "@hs/api-client";
const destinations = [
  { href: "/", label: "Khám phá", Icon: Box },
  { href: "/thu-vien", label: "Thư viện", Icon: BookOpen },
  { href: "/co-so-y-te", label: "Cơ sở y tế", Icon: Hospital },
  { href: "/hoc-tap", label: "Học tập", Icon: GraduationCap },
  { href: "/gioi-thieu", label: "Về SatsunicMec", Icon: Info },
];
export default function Header({ fullDocument = false, authenticated }: { onLogin?: () => void; fullDocument?: boolean; authenticated?: boolean }) {
  const Nav = fullDocument ? "a" : Link;
  const pathname = usePathname();
  const [session, setSession] = useState(false);
  useEffect(() => {
    if (authenticated !== undefined) return;
    let active = true;
    let controller: AbortController | undefined;
    const refresh = () => {
      controller?.abort();
      const pending = new AbortController();
      controller = pending;
      void request('/api/v1/me', { signal: pending.signal }).then(() => { if (active && !pending.signal.aborted) setSession(true); }).catch(() => { if (active && !pending.signal.aborted) setSession(false); });
    };
    refresh(); window.addEventListener('hs-auth-changed', refresh);
    return () => { active = false; controller?.abort(); window.removeEventListener('hs-auth-changed', refresh); };
  }, [authenticated]);
  const signedIn = authenticated ?? session;
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);
  function close(restore = false) {
    setOpenPath(null);
    if (restore) toggle.current?.focus();
  }
  return (
    <>
    <header className="app-header" onKeyDown={(event) => {
      if (event.key === "Escape" && open) { event.preventDefault(); close(true); }
    }} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <Nav href="/" className="wordmark" aria-label="SatsunicMec — trang khám phá" onClick={() => close()}>
        <img className="brand-icon" src="/brand/satsunicmec-mark.svg" width={36} height={36} alt="" />
        <span className="brand-name">Satsunic<span className="brand-suffix">Mec</span></span>
      </Nav>
      <nav className="desktop-navigation" aria-label="Điều hướng chính">
        {destinations.map(({ href, label, Icon }) => (
          <Nav key={href} href={href} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}>
            <Icon size={16} aria-hidden="true" />{label}
          </Nav>
        ))}
      </nav>
      <div className="header-actions">
        <>{signedIn ? <Nav href="/tai-khoan" className="login-button" onClick={() => close()} aria-current={pathname.startsWith("/tai-khoan") ? "page" : undefined}><UserRound size={16} aria-hidden="true" />Tài khoản</Nav> : null}</>
        <button ref={toggle} className="mobile-menu-toggle" aria-label={open ? "Đóng menu" : "Mở menu"} title={open ? "Đóng menu" : "Mở menu"} aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpenPath(open ? null : pathname)}>
          {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </div>
      {open && <nav id="mobile-menu" className="mobile-menu" aria-label="Điều hướng di động">
        {destinations.map(({ href, label, Icon }) => <Nav key={href} href={href} onClick={() => close()} aria-current={(href === "/" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}><Icon size={18} aria-hidden="true" />{label}</Nav>)}
      </nav>}
    </header>
    </>
  );
}
