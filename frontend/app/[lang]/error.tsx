"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const lang = usePathname()?.split('/')[1] === 'en' ? 'en' : 'fa';
  return <section className="min-h-[70vh] pt-40 pb-20 px-6 text-center">
    <h1 className="text-3xl font-serif mb-5">{lang === 'fa' ? 'دریافت اطلاعات انجام نشد' : 'We could not load this page'}</h1>
    <p className="text-gray-500 mb-8">{lang === 'fa' ? 'لطفاً دوباره تلاش کنید.' : 'Please try again in a moment.'}</p>
    <button onClick={reset} className="bg-ariwatch-black text-white px-8 py-3">{lang === 'fa' ? 'تلاش دوباره' : 'Try again'}</button>
    <Link href={`/${lang}`} className="block mt-6 underline">{lang === 'fa' ? 'صفحه اصلی' : 'Back to home'}</Link>
  </section>;
}
