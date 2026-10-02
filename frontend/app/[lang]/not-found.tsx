"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function NotFoundPage() {
  const lang = usePathname()?.split('/')[1] === 'en' ? 'en' : 'fa';
  return <section className="min-h-[70vh] pt-40 pb-20 px-6 text-center">
    <p className="text-ariwatch-red mb-4">404</p>
    <h1 className="text-3xl font-serif mb-8">{lang === 'fa' ? 'صفحه پیدا نشد' : 'Page not found'}</h1>
    <Link href={`/${lang}/watches`} className="border border-black px-8 py-3 inline-block">{lang === 'fa' ? 'مشاهده مجموعه' : 'Explore the collection'}</Link>
  </section>;
}
