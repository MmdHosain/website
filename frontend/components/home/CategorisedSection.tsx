import Link from "next/link";

interface CategorisedSectionProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function CategorisedSection({ lang, dict, isFa }: CategorisedSectionProps) {
  return (
    <section className="py-32 px-8 text-center bg-white flex flex-col items-center">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-ariwatch-red mb-8 uppercase tracking-widest">
        {dict.home.clearlyCategorised}
      </h2>
      <p className="text-ariwatch-gray mb-12 text-lg md:text-xl leading-relaxed max-w-4xl">
        {dict.home.categorisedDesc}
      </p>
      <Link href={`/${lang}/watches`}>
        <button className="border border-gray-300 px-10 py-4 text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-gray-50 transition mb-24">
          {dict.home.viewWatches}
        </button>
      </Link>

      {/* Large Lifestyle Images below text */}
      <div className="flex flex-col md:flex-row justify-center gap-8 w-full max-w-[1600px]">
        <div className="w-full md:w-1/2 h-[500px] bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500 font-serif text-xl">Lifestyle Image 1</span>
        </div>
        <div className="w-full md:w-1/2 h-[500px] bg-gray-200 flex items-center justify-center relative">
          <span className="text-gray-500 font-serif text-xl">Lifestyle Image 2 (Detail)</span>
          {/* Pause Icon Mock */}
          <div className={`absolute bottom-6 ${isFa ? 'left-6' : 'right-6'} flex gap-1`}>
            <div className="w-1 h-5 bg-white/70"></div>
            <div className="w-1 h-5 bg-white/70"></div>
          </div>
          {/* Mini slider controls for image 2 */}
          <div className={`absolute bottom-0 ${isFa ? 'right-0' : 'left-0'} flex bg-white`}>
             <div className="h-12 flex items-center px-4">
                <span className="text-xs font-bold tracking-widest text-ariwatch-gray">1 / 6</span>
             </div>
             <button className="w-12 h-12 bg-gray-50 flex items-center justify-center text-ariwatch-black hover:bg-gray-100 transition">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFa ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}></path></svg>
             </button>
             <button className="w-12 h-12 bg-white flex items-center justify-center text-ariwatch-black hover:bg-gray-50 transition">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFa ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}></path></svg>
             </button>
          </div>
        </div>
      </div>
    </section>
  );
}
