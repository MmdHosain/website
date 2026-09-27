import Link from "next/link";

interface FooterProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function Footer({ lang, dict, isFa }: FooterProps) {
  return (
    <footer className="bg-ariwatch-cream pt-20 pb-10 border-t border-gray-200 uppercase">
      <div className="max-w-[1600px] mx-auto px-8">
        {/* Footer sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 text-xs tracking-widest">
          <div>
            <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.theCollection}</h4>
            <ul className="space-y-4 text-ariwatch-gray">
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.womenWatches}</Link></li>
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.menWatches}</Link></li>
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.classic}</Link></li>
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.sport}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.findAriwatch}</h4>
            <ul className="space-y-4 text-ariwatch-gray">
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.shopByStyle}</Link></li>
              <li><Link href={`/${lang}/watches`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.shopByColour}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.purchaseSupport}</h4>
            <ul className="space-y-4 text-ariwatch-gray">
              <li><Link href={`/${lang}/support`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.requestVideo}</Link></li>
              <li><Link href={`/${lang}/support`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.deliveryInfo}</Link></li>
              <li><Link href={`/${lang}/support`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.faq}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.subscribe}</h4>
            <div className="flex flex-col gap-4">
              <input type="email" placeholder={dict.footer.emailPlaceholder} className="border-b border-gray-300 bg-transparent py-2 focus:outline-none focus:border-ariwatch-black transition" />
              <button className="text-left text-ariwatch-red font-bold hover:text-ariwatch-black transition rtl:text-right">
                SUBMIT
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex justify-between items-center text-[10px] tracking-widest text-ariwatch-gray border-t border-gray-200 pt-8">
          <div className="flex gap-6">
            <Link href={`/${lang}/terms`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.terms}</Link>
            <Link href={`/${lang}/privacy`} className="cursor-pointer hover:text-ariwatch-black transition">{dict.footer.privacy}</Link>
          </div>
          <p>{dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
