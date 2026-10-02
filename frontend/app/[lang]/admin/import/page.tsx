import { AdminImport } from '../../../../components/admin/import/AdminImport';
export default async function ImportPage({ params }:{ params:Promise<{ lang:string }> }) {
  const { lang }=await params;return <AdminImport lang={lang==='en' ? 'en' : 'fa'}/>;
}
