import Link from "next/link";

export function FooterLinks({ lang, dict }: { lang: string, dict: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-xs tracking-widest">
      <div>
        <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.theCollection}</h4>
        <ul className="space-y-4 text-ariwatch-gray">
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.womenWatches}</Link></li>
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.menWatches}</Link></li>
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.classic}</Link></li>
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.sport}</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.findAriwatch}</h4>
        <ul className="space-y-4 text-ariwatch-gray">
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.shopByStyle}</Link></li>
          <li><Link href={`/${lang}/watches`} className="hover:text-ariwatch-black transition">{dict.footer.shopByColour}</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.purchaseSupport}</h4>
        <ul className="space-y-4 text-ariwatch-gray">
          <li><Link href={`/${lang}/concierge`} className="hover:text-ariwatch-black transition">{dict.footer.requestVideo}</Link></li>
          <li><Link href={`/${lang}/support`} className="hover:text-ariwatch-black transition">{dict.footer.deliveryInfo}</Link></li>
          <li><Link href={`/${lang}/support`} className="hover:text-ariwatch-black transition">{dict.footer.faq}</Link></li>
        </ul>
      </div>
    </div>
  );
}
