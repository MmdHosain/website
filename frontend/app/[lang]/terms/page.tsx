import { StoreNotice } from "../../../components/layout/StoreNotice";
export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa"; return <StoreNotice lang={lang} kind="terms" />; }
