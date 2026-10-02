import { AdminDiscounts } from '../../../../components/admin/AdminDiscounts';
export default async function DiscountsPage({ params }: { params: Promise<{ lang: string }> }) { return <AdminDiscounts lang={(await params).lang} />; }
