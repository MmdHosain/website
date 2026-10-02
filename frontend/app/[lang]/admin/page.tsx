import { getDictionary } from "../../dictionaries";
import { AdminCatalog } from "../../../components/admin/AdminCatalog";

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  return <AdminCatalog lang={lang} dict={dict} />;
}
