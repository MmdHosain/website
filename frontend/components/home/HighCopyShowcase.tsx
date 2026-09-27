import Link from 'next/link';

export function HighCopyShowcase({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <section className="bg-white w-full border-t border-gray-100">
      {/* Top Section */}
      <div className="py-16 md:py-20 text-center px-6 flex flex-col items-center">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-4 block">
          {dict.highCopyShowcase.badge}
        </span>
        <h2 className="text-3xl md:text-5xl font-light text-ariwatch-black uppercase tracking-wider mb-4 max-w-4xl mx-auto">
          {dict.highCopyShowcase.title}
        </h2>
        <p className="text-ariwatch-gray text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-8">
          {dict.highCopyShowcase.desc}
        </p>
        <Link href={`/${lang}/watches?category=highcopy`}>
          <button className="border border-ariwatch-black px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
            {dict.highCopyShowcase.cta}
          </button>
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-6 max-w-[1500px] mx-auto px-6 pb-20 items-stretch">
        {/* Left Block */}
        <div className="w-full md:w-[65%] bg-[#f4f4f4] min-h-[360px] flex items-center justify-center p-8 border border-gray-100/50">
          <div className="w-full max-w-md aspect-[4/3] bg-gray-200/50 flex items-center justify-center text-gray-400 border border-gray-200 shadow-sm">
             Horizontal Watch (Santos Style)
          </div>
        </div>
        {/* Right Block */}
        <div className="w-full md:w-[35%] bg-white border border-gray-100 min-h-[360px] flex items-center justify-center p-8">
          <div className="w-full max-w-xs aspect-[3/4] bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
             Vertical Macro Dial Closeup
          </div>
        </div>
      </div>
    </section>
  );
}
