import { getDictionary } from "../../dictionaries";
import { ConciergeForm } from "../../../components/concierge/ConciergeForm";

export default async function ConciergePage({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';
  
  return (
    <div className="w-full min-h-screen bg-ariwatch-cream pt-24 md:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row gap-16">
        {/* Info Section */}
        <div className="w-full lg:w-1/3 pt-8">
           <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-ariwatch-black uppercase tracking-widest mb-6">
             {dict.concierge.title}
           </h1>
           <p className="text-ariwatch-gray text-sm md:text-base leading-relaxed mb-12">
             {dict.concierge.subtitle}
           </p>
           <div className="flex flex-col gap-6 text-sm">
             <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold tracking-widest text-ariwatch-red uppercase">WhatsApp</span>
               <span className="font-medium text-ariwatch-black tracking-wider">+971 50 123 4567</span>
             </div>
             <div className="flex flex-col gap-2">
               <span className="text-[10px] font-bold tracking-widest text-ariwatch-red uppercase">Email</span>
               <span className="font-medium text-ariwatch-black tracking-wider">concierge@ariwatch.com</span>
             </div>
           </div>
        </div>
        
        {/* Form Section */}
        <div className="w-full lg:w-2/3 bg-white p-8 md:p-16 border border-gray-100 shadow-sm">
           <ConciergeForm lang={lang} dict={dict} isFa={isFa} />
        </div>
      </div>
    </div>
  );
}
