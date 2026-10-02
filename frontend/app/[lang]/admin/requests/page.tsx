import { AdminRequests } from "../../../../components/admin/AdminRequests";

export default async function AdminRequestsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  return <AdminRequests lang={lang} />;
}
