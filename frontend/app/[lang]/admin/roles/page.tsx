import { AdminRoles } from '../../../../components/admin/AdminRoles';
export default async function RolesPage({ params }: { params: Promise<{ lang: string }> }) { return <AdminRoles lang={(await params).lang} />; }
