import { SalesReport } from '../../../../components/admin/reports/SalesReport';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <SalesReport lang={lang === 'en' ? 'en' : 'fa'} />;
}
