import { getDictionary } from "../../dictionaries";
import { AdminAccess } from "../../../components/admin/AdminAccess";
import { AdminNavigation, AdminSection } from "../../../components/admin/AdminNavigation";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: requestedLang } = await params;
  const lang = requestedLang === "en" ? "en" : "fa";
  const dict = await getDictionary(lang);
  const isFa = lang === "fa";

  return (
    <AdminAccess lang={lang} dict={dict}>
      <div className="min-h-[70vh] bg-gray-50 flex flex-col md:flex-row">
        <aside className="w-full md:w-64 md:shrink-0 bg-ariwatch-black text-white p-6 flex flex-col gap-8">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="w-10 h-10 bg-ariwatch-red flex items-center justify-center font-serif text-xl">A</div>
            <div>
              <h2 className="font-serif tracking-widest">{isFa ? "مدیریت" : "ADMIN"}</h2>
              <p className="text-xs text-gray-400">{dict.admin.dashboard}</p>
            </div>
          </div>
          <AdminNavigation lang={lang} />
        </aside>
        <section className="min-w-0 flex-1 p-6 md:p-10"><AdminSection lang={lang}>{children}</AdminSection></section>
      </div>
    </AdminAccess>
  );
}
