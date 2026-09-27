import Link from 'next/link';

export function BrandStoryTeaser({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <section className="bg-white py-20 w-full border-t border-gray-100">
      {/* Header */}
      <div className="text-center px-6 mb-16">
        <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-gray uppercase mb-4 block">
          {dict.storyTeaser.subtitle}
        </span>
        <h2 className="text-3xl md:text-5xl font-serif text-ariwatch-black uppercase tracking-wide">
          {dict.storyTeaser.title}
        </h2>
      </div>

      {/* 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1600px] mx-auto px-6 py-4 mb-16">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className="flex flex-col group cursor-pointer">
            <div className="w-full aspect-[4/5] bg-gray-100 mb-6 border border-gray-200/60 overflow-hidden flex items-center justify-center">
              <span className="text-gray-400 text-sm font-serif">Placeholder {num}</span>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-ariwatch-red uppercase mb-3">
              {dict.storyTeaser[`card${num}Tag`]}
            </span>
            <h3 className="text-sm md:text-base font-bold tracking-wider text-ariwatch-black uppercase mb-3 line-clamp-2">
              {dict.storyTeaser[`card${num}Title`]}
            </h3>
            <p className="text-xs md:text-sm text-ariwatch-gray leading-relaxed line-clamp-3">
              {dict.storyTeaser[`card${num}Desc`]}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Action */}
      <div className="text-center">
        <Link href={`/${lang}/story`}>
          <button className="border border-ariwatch-black px-10 py-4 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
            {dict.storyTeaser.cta}
          </button>
        </Link>
      </div>
    </section>
  );
}
