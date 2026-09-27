import { FooterLinks } from "./footer/FooterLinks";
import { FooterNewsletter } from "./footer/FooterNewsletter";
import { FooterBottom } from "./footer/FooterBottom";

interface FooterProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function Footer({ lang, dict, isFa }: FooterProps) {
  return (
    <footer className="bg-ariwatch-cream pt-20 pb-10 border-t border-gray-200 uppercase">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-3">
            <FooterLinks lang={lang} dict={dict} />
          </div>
          <div className="md:col-span-1">
            <FooterNewsletter dict={dict} isFa={isFa} />
          </div>
        </div>
        <FooterBottom lang={lang} dict={dict} />
      </div>
    </footer>
  );
}
