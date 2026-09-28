import { getDictionary } from "../../dictionaries";
import Link from "next/link";

export default async function CartPage({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  
  return (
    <div className="w-full min-h-[70vh] bg-white pt-32 pb-24 flex flex-col items-center justify-center">
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <h1 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-8">
          {dict.cart.title}
        </h1>
        <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-8">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="text-ariwatch-gray text-lg mb-12">
          {dict.cart.empty}
        </p>
        <Link href={`/${lang}/watches`}>
          <button className="border border-ariwatch-black px-10 py-4 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
            {dict.cart.continue}
          </button>
        </Link>
      </div>
    </div>
  );
}
