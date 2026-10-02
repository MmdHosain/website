import Link from 'next/link';

export function HighCopyShowcase({ lang, dict }: { lang: string, dict: any, isFa: boolean }) {
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
        <Link href={`/${lang}/watches?category=highcopy`} className="inline-block border border-ariwatch-black px-8 py-3 text-[10px] md:text-xs font-bold tracking-widest text-ariwatch-black uppercase hover:bg-black hover:text-white transition-all">
          {dict.highCopyShowcase.cta}
        </Link>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col md:flex-row gap-6 max-w-[1500px] mx-auto px-6 pb-20 items-stretch">
        {/* Left Block */}
        <div className="w-full md:w-[65%] bg-[#f4f4f4] min-h-[360px] flex items-center justify-center p-8 border border-gray-100/50">
          <img src="/resourses/photo-1614164185128-e4ec99c436d7.jpg" alt={dict.highCopyShowcase.title} loading="lazy" className="w-full max-w-md aspect-[4/3] object-cover" />
        </div>
        {/* Right Block */}
        <div className="w-full md:w-[35%] bg-white border border-gray-100 min-h-[360px] flex items-center justify-center p-8">
          <img src="/resourses/photo-1522312346375-d1a52e2b99b3.jpg" alt={dict.highCopyShowcase.badge} loading="lazy" className="w-full max-w-xs aspect-[3/4] object-cover" />
        </div>
      </div>
    </section>
  );
}
