import Link from "next/link";

interface HeroTextProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function HeroText({ lang, dict, isFa }: HeroTextProps) {
  return (
    <div className={`w-full h-1/2 md:h-full md:w-[45%] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-4 md:py-20 z-20 ${isFa ? 'order-2 md:order-1' : 'order-2 md:order-1'}`}>
      <div className="max-w-lg">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#121212] mb-2 md:mb-6 leading-[1.1] md:leading-[1.2] tracking-tight">
          {dict.home.heroHeadline}
        </h1>
        <p className="text-sm sm:text-base md:text-xl text-[#666666] mb-4 md:mb-12 font-medium leading-relaxed">
          {dict.home.heroSubheadline}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
          <Link href={`/${lang}/watches`} className="flex-1">
            <button className="w-full px-4 py-2 md:px-8 md:py-4 bg-ariwatch-red text-white text-xs md:text-sm font-bold tracking-widest rounded-[4px] hover:bg-red-800 transition-colors shadow-lg shadow-ariwatch-red/20">
              {dict.home.ctaPrimary}
            </button>
          </Link>
          <Link href={`/${lang}/story`} className="flex-1">
            <button className="w-full px-4 py-2 md:px-8 md:py-4 bg-transparent text-[#121212] border border-[#121212]/20 text-xs md:text-sm font-bold tracking-widest rounded-[4px] hover:bg-[#121212]/5 transition-colors">
              {dict.home.ctaSecondary}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
