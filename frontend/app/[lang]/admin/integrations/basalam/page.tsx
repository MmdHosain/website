import { BasalamMappings } from '../../../../../components/admin/integrations/BasalamMappings';
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <BasalamMappings lang={lang === 'en' ? 'en' : 'fa'} />;
}
