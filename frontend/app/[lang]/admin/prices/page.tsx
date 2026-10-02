import { PriceReports } from '../../../../components/admin/integrations/PriceReports';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <PriceReports lang={lang === 'en' ? 'en' : 'fa'} />;
}
