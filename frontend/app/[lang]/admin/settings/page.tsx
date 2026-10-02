import { StoreSettings } from '../../../../components/admin/StoreSettings';
export default async function SettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  return <StoreSettings lang={(await params).lang} />;
}
