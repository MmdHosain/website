import Link from 'next/link';

export function CategorisedLookbook({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <section className="bg-white py-20 w-full">
      {/* Header */}
      <div className="text-center px-6 mb-16 flex flex-col items-center">
        <h2 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-wide mb-6">
          {dict.lookbook.title}
        </h2>
        <p className="text-ariwatch-gray text-sm md:text-base leading-relaxed max-w-3xl mx-auto mb-8">
          {dict.lookbook.subtitle}
        </p>
        <Link href={`/${lang}/watches`}>
          <button className="border border-ariwatch-black px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
            {dict.lookbook.cta}
          </button>
        </Link>
      </div>

      {/* Asymmetrical Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Left Column (Lifestyle) */}
        <div className="h-[400px] md:h-[540px] bg-gray-200 relative overflow-hidden flex items-center justify-center border border-gray-100">
          <span className="text-gray-500 font-serif">Lifestyle Container</span>
          <button className={`absolute bottom-6 ${isFa ? 'left-6' : 'right-6'} w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors`}>
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8 h-full justify-between">
          {/* Top Box (Video/Macro) */}
          <div className="h-[280px] bg-gray-300 relative flex items-center justify-center border border-gray-100">
            <span className="text-gray-500 font-serif">Video / Macro Container</span>
            <div className={`absolute bottom-4 ${isFa ? 'left-4' : 'right-4'} flex gap-1 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/40 transition`}>
              <div className="w-1.5 h-4 bg-white rounded-sm"></div>
              <div className="w-1.5 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
          
          {/* Bottom Box (Product Details) */}
          <div className="flex flex-row items-center gap-6 md:gap-8 h-auto">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white border border-gray-100 flex-shrink-0 flex items-center justify-center p-2 shadow-sm">
               <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs text-gray-400">Product</div>
            </div>
            <div className="flex flex-col justify-center flex-1 py-2">
              <div className="flex items-center gap-4 mb-4" dir="ltr">
                <span className="text-[10px] font-bold tracking-widest text-ariwatch-gray">3 / 6</span>
                <div className="flex gap-2">
                  <button className="w-6 h-6 border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button className="w-6 h-6 border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
              <h4 className="text-sm md:text-base font-bold tracking-wider text-ariwatch-black uppercase mb-2">
                {dict.lookbook.productTitle}
              </h4>
              <p className="text-xs text-ariwatch-gray mb-4 line-clamp-2">
                {dict.lookbook.productDesc}
              </p>
              <Link href={`/${lang}/watches`} className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-ariwatch-black underline underline-offset-4 hover:text-ariwatch-red transition-colors w-fit">
                {dict.lookbook.details}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
