import Link from "next/link";

export interface HeroCopy {
  heroHeadline: string;
  heroSubheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface HeroTextProps {
  lang: "en" | "fa";
  copy: HeroCopy;
  isFa: boolean;
}

export function HeroText({ lang, copy, isFa }: HeroTextProps) {
  return (
    <div className="relative order-2 min-w-0 self-center md:order-1" dir={isFa ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-lg text-center md:text-start">
        <h1 className="text-[28px] font-black leading-[1.25] tracking-tight text-[#22211f] sm:text-4xl md:text-[40px] lg:text-5xl xl:text-6xl">
          {copy.heroHeadline}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-[#77736b] md:mx-0 md:mt-6 md:text-base lg:text-lg">
          {copy.heroSubheadline}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-9 lg:gap-4">
          <Link href={`/${lang}/watches`} className="flex min-h-12 items-center justify-center rounded-[3px] bg-ariwatch-red px-3 py-3 text-center text-[11px] font-semibold tracking-wide text-white shadow-lg shadow-ariwatch-red/10 transition-colors hover:bg-red-800 sm:text-xs lg:text-sm">
            {copy.ctaPrimary}
          </Link>
          <Link href={`/${lang}/story`} className="flex min-h-12 items-center justify-center rounded-[3px] border border-[#bfb8aa] px-3 py-3 text-center text-[11px] font-semibold tracking-wide text-[#39362f] transition-colors hover:bg-white/50 sm:text-xs lg:text-sm">
            {copy.ctaSecondary}
          </Link>
        </div>
      </div>
    </div>
  );
}
