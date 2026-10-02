import { IntegrationStatus } from '../../../../components/admin/integrations/IntegrationStatus';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <IntegrationStatus lang={lang === 'en' ? 'en' : 'fa'} />;
}
