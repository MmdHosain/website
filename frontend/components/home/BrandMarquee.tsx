export function BrandMarquee({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <div className="py-5 border-y border-gray-200/60 bg-[#fdfcfb] overflow-hidden flex" dir="ltr">
      <div className="flex w-max animate-marquee md:animate-none md:w-full md:justify-center gap-12 px-6">
        {dict.brandMarquee.map((brand: string, idx: number) => (
          <span key={idx} className="font-serif text-ariwatch-gray/80 uppercase tracking-[0.2em] text-sm md:text-base font-semibold whitespace-nowrap">
            {brand}
          </span>
        ))}
        {/* Duplicate for infinite crawl on mobile */}
        {dict.brandMarquee.map((brand: string, idx: number) => (
          <span key={`dup-${idx}`} className="md:hidden font-serif text-ariwatch-gray/80 uppercase tracking-[0.2em] text-sm md:text-base font-semibold whitespace-nowrap">
            {brand}
          </span>
        ))}
      </div>
    </div>
  );
}
