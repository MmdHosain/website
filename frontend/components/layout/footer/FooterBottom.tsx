import Link from "next/link";

export function FooterBottom({ lang, dict }: { lang: string, dict: any }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-between items-center text-[10px] tracking-widest text-ariwatch-gray border-t border-gray-200 pt-8">
      <div className="flex gap-6">
        <Link href={`/${lang}/terms`} className="hover:text-ariwatch-black transition">
          {dict.footer.terms}
        </Link>
        <Link href={`/${lang}/privacy`} className="hover:text-ariwatch-black transition">
          {dict.footer.privacy}
        </Link>
      </div>
      <p>{dict.footer.copyright}</p>
    </div>
  );
}
