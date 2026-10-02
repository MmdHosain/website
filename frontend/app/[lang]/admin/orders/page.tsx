import { AdminOrders } from "../../../../components/admin/AdminOrders";

export default async function AdminOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  return <AdminOrders lang={lang} />;
}
