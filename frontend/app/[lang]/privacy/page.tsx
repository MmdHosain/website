import { StoreNotice } from "../../../components/layout/StoreNotice";
export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa"; return <StoreNotice lang={lang} kind="privacy" />; }
