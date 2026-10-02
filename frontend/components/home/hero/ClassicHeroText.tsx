import Link from "next/link";
import type { HeroCopy } from "./HeroText";

interface ClassicHeroTextProps {
  lang: "en" | "fa";
  copy: HeroCopy;
  isFa: boolean;
}

export function ClassicHeroText({ lang, copy, isFa }: ClassicHeroTextProps) {
  return (
    <div className="z-20 order-2 flex h-1/2 w-full flex-col justify-center px-6 py-4 md:order-1 md:h-full md:w-[45%] md:px-16 md:py-20 lg:px-24" dir={isFa ? "rtl" : "ltr"}>
      <div className="max-w-lg">
        <h1 className="mb-2 text-3xl font-black leading-[1.1] tracking-tight text-[#121212] sm:text-4xl md:mb-6 md:text-5xl md:leading-[1.2] lg:text-6xl">
          {copy.heroHeadline}
        </h1>
        <p className="mb-4 text-sm font-medium leading-relaxed text-[#666666] sm:text-base md:mb-12 md:text-xl">
          {copy.heroSubheadline}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row md:gap-4">
          <Link href={`/${lang}/watches`} className="block w-full flex-1 rounded-[4px] bg-ariwatch-red px-4 py-2 text-center text-xs font-bold tracking-widest text-white shadow-lg shadow-ariwatch-red/20 transition-colors hover:bg-red-800 md:px-8 md:py-4 md:text-sm">
            {copy.ctaPrimary}
          </Link>
          <Link href={`/${lang}/story`} className="block w-full flex-1 rounded-[4px] border border-[#121212]/20 bg-transparent px-4 py-2 text-center text-xs font-bold tracking-widest text-[#121212] transition-colors hover:bg-[#121212]/5 md:px-8 md:py-4 md:text-sm">
            {copy.ctaSecondary}
          </Link>
        </div>
      </div>
    </div>
  );
}
