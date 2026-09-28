import { getDictionary } from "../../dictionaries";

export default async function TermsPage({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  
  return (
    <div className="w-full min-h-[70vh] bg-white pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <h1 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-8">
          {dict.legal.termsTitle}
        </h1>
        <p className="text-ariwatch-gray leading-relaxed">
          {dict.legal.content}
        </p>
      </div>
    </div>
  );
}
