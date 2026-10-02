import Link from 'next/link';

export function CustomOrderBanner({ lang, dict }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <section className="bg-ariwatch-black w-full">
      <div className="py-12 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-6 max-w-[1500px] mx-auto">
        <div className="flex-1">
          <span className="text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-red uppercase mb-3 block">
            {dict.customOrderBanner.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-wider mb-3">
            {dict.customOrderBanner.title}
          </h2>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            {dict.customOrderBanner.desc}
          </p>
        </div>
        <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
          <Link href={`/${lang}/concierge`} className="w-full md:w-auto inline-block text-center border border-white px-8 py-4 text-[10px] md:text-xs font-bold tracking-widest text-white uppercase hover:bg-white hover:text-black transition-all">
            {dict.customOrderBanner.cta}
          </Link>
        </div>
      </div>
    </section>
  );
}
