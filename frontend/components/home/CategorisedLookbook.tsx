import Link from 'next/link';
const photos = [
  '/resourses/photo-1524592094714-0f0654e20314.jpg',
  '/resourses/photo-1523170335258-f5ed11844a49.jpg',
];
export function CategorisedLookbook({ lang, dict }: { lang: string; dict: any; isFa: boolean }) {
  return <section className="bg-white py-20 w-full">
    <div className="text-center px-6 mb-12">
      <h2 className="text-3xl md:text-5xl font-serif mb-6">{dict.lookbook.title}</h2>
      <p className="text-gray-500 max-w-3xl mx-auto mb-8 leading-relaxed">{dict.lookbook.subtitle}</p>
      <Link href={`/${lang}/watches`} className="inline-block border border-black px-8 py-3 text-xs font-bold">{dict.lookbook.cta}</Link>
    </div>
    <div className="grid lg:grid-cols-2 gap-8 max-w-[1600px] mx-auto px-6 md:px-12">
      <Link href={`/${lang}/watches?category=original`} className="group relative block overflow-hidden bg-gray-100 h-[400px] md:h-[540px]">
        <img src={photos[0]} alt={dict.header.original} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <span className="absolute bottom-6 left-6 bg-white px-6 py-3 text-xs font-bold">{dict.header.original}</span>
      </Link>
      <div className="flex flex-col gap-8">
        <Link href={`/${lang}/watches?category=highcopy`} className="block overflow-hidden bg-gray-100 h-[280px]"><img src={photos[1]} alt={dict.header.highCopy} loading="lazy" className="w-full h-full object-cover" /></Link>
        <div className="p-6 md:p-10 border border-gray-100 flex-1">
          <h3 className="font-serif text-xl mb-4">{dict.lookbook.productTitle}</h3>
          <p className="text-sm text-gray-500 mb-6 leading-7">{dict.lookbook.productDesc}</p>
          <Link href={`/${lang}/watches`} className="text-xs underline underline-offset-4">{dict.lookbook.details}</Link>
        </div>
      </div>
    </div>
  </section>;
}
