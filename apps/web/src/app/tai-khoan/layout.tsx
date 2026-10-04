import type { Metadata } from 'next';
import AccountShell from '../../components/account/account-shell';
export const metadata: Metadata = { title: 'Tài khoản', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AccountLayout({ children }: { children: React.ReactNode }) { return <AccountShell>{children}</AccountShell>; }
