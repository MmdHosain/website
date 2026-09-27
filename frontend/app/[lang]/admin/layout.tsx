import { getDictionary } from "../../dictionaries";
import Link from "next/link";

export default async function AdminLayout({
  children,
  params: { lang }
}: {
  children: React.ReactNode;
  params: { lang: 'en' | 'fa' };
}) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-inter">
      {/* Simple Sidebar */}
      <aside className="w-full md:w-64 bg-ariwatch-black text-white p-6 flex flex-col gap-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="w-10 h-10 bg-ariwatch-red flex items-center justify-center font-serif text-xl">
            A
          </div>
          <div>
             <h2 className="font-serif tracking-widest">ADMIN</h2>
             <p className="text-xs text-gray-400">{dict.admin.dashboard}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href={`/${lang}/admin`} className="text-sm tracking-wider uppercase text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded transition">
            {dict.admin.products}
          </Link>
          <Link href={`/${lang}/admin/watches/new`} className="text-sm tracking-wider uppercase text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded transition">
            {dict.admin.addNew}
          </Link>
          <Link href={`/${lang}`} className="text-sm tracking-wider uppercase text-gray-300 hover:text-white hover:bg-white/5 p-3 rounded transition mt-auto">
            &larr; Exit Admin
          </Link>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
