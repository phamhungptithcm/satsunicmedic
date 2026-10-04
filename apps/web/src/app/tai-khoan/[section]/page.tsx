import { notFound } from 'next/navigation';
import AccountPage from '../../../components/account/account-page';
import { accountSections } from '../../../lib/account';
export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!accountSections.some(item => item.slug === section) && !['nang-cap', 'ket-qua', 'xoa'].includes(section)) notFound();
  return <AccountPage section={section} />;
}
