import Link from 'next/link';

export function CategorySpotlight({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <section className="flex flex-col md:flex-row w-full bg-white">
      {/* Left Column */}
      <div className="w-full md:w-1/2 bg-[#fcfbf9] min-h-[440px] md:min-h-[580px] relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-gray-100">
        <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-100 aspect-square border border-gray-200/50 shadow-sm flex items-center justify-center text-gray-400">
          Horizontal Watch
        </div>
        <button className={`absolute bottom-6 ${isFa ? 'left-6' : 'right-6'} w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors z-10`}>
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      </div>
      {/* Right Column */}
      <div className="w-full md:w-1/2 px-8 md:px-20 py-12 flex flex-col justify-center items-start">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
          {dict.categorySpotlight.badge}
        </span>
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-ariwatch-black uppercase tracking-wide mb-6">
          {dict.categorySpotlight.title}
        </h2>
        <p className="text-ariwatch-gray text-sm md:text-base leading-relaxed mb-10 max-w-md">
          {dict.categorySpotlight.desc}
        </p>
        <Link href={`/${lang}/watches?category=original`}>
          <button className="border border-ariwatch-black px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
            {dict.categorySpotlight.cta}
          </button>
        </Link>
      </div>
    </section>
  );
}
