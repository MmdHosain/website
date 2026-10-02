import Link from "next/link";
export function FooterLinks({ lang, dict }: { lang: string; dict: any }) {
  const groups = [
    { title: dict.footer.theCollection, links: [
      [`/${lang}/watches`, dict.header.watches],
      [`/${lang}/watches?category=original`, dict.header.original],
      [`/${lang}/watches?category=highcopy`, dict.header.highCopy],
      [`/${lang}/concierge`, dict.header.customOrder],
    ] },
    { title: dict.footer.worldOfAriwatch, links: [
      [`/${lang}/story`, dict.footer.brandStory],
      [`/${lang}/story/arash-khandan`, dict.footer.arashKhandan],
      [`/${lang}/story/melina`, dict.footer.melina],
      [`/${lang}/story/company`, dict.footer.arashCompany],
    ] },
    { title: dict.footer.purchaseSupport, links: [
      [`/${lang}/orders`, lang === 'fa' ? 'سفارش‌های من' : 'My orders'],
      [`/${lang}/concierge`, dict.footer.contactUs],
      [`/${lang}/support`, dict.footer.deliveryInfo],
      [`/${lang}/support`, dict.footer.faq],
    ] },
  ];
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-xs tracking-widest">{groups.map(group =>
    <div key={group.title}><h4 className="font-bold mb-6">{group.title}</h4><ul className="space-y-4 text-gray-500">{group.links.map(([href, label]) => <li key={label}><Link href={href} className="hover:text-black">{label}</Link></li>)}</ul></div>
  )}</div>;
}
