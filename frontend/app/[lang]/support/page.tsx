import { getDictionary } from "../../dictionaries";

export default async function SupportPage({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  
  return (
    <div className="w-full min-h-screen bg-white pt-24 md:pt-32 pb-24">
      <div className="max-w-[1000px] mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-4">
             {dict.support.title}
           </h1>
           <p className="text-ariwatch-gray text-sm md:text-base">{dict.support.subtitle}</p>
        </div>
        
        <div className="flex flex-col gap-8">
           <div className="border-b border-gray-100 pb-6">
             <h3 className="text-sm md:text-base font-bold text-ariwatch-black uppercase tracking-widest mb-3">
               {dict.support.faq1Q}
             </h3>
             <p className="text-ariwatch-gray leading-relaxed">
               {dict.support.faq1A}
             </p>
           </div>
           <div className="border-b border-gray-100 pb-6">
             <h3 className="text-sm md:text-base font-bold text-ariwatch-black uppercase tracking-widest mb-3">
               {dict.support.faq2Q}
             </h3>
             <p className="text-ariwatch-gray leading-relaxed">
               {dict.support.faq2A}
             </p>
           </div>
           <div className="border-b border-gray-100 pb-6">
             <h3 className="text-sm md:text-base font-bold text-ariwatch-black uppercase tracking-widest mb-3">
               {dict.support.faq3Q}
             </h3>
             <p className="text-ariwatch-gray leading-relaxed">
               {dict.support.faq3A}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
