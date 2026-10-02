import Link from 'next/link';
import { blogService } from '../../../services/blog.service';
import { pageMetadata } from '../../../services/seo';
export async function generateMetadata({ params }:{ params:Promise<{ lang:string }> }) {
  const { lang:raw } = await params, lang = raw === 'en' ? 'en' : 'fa';
  return pageMetadata(lang,'/blog',lang === 'fa' ? 'مجله ساعت | آری‌واچ' : 'Watch journal | Ariwatch',lang === 'fa' ? 'راهنما و مطالب دنیای ساعت در مجله آری‌واچ.' : 'Watch guides and articles from the Ariwatch journal.');
}
export default async function BlogPage({ params }:{ params:Promise<{ lang:string }> }) {
  const { lang:raw } = await params, lang = raw === 'en' ? 'en' : 'fa', fa = lang === 'fa';
  let articles:Awaited<ReturnType<typeof blogService.list>> = [], failed = false;
  try { articles = await blogService.list(lang); } catch { failed=true; }
  return <div className="pt-28 md:pt-36 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
    <p className="text-xs uppercase tracking-widest text-ariwatch-red mb-4">ARIWATCH JOURNAL</p>
    <h1 className="font-serif text-4xl md:text-5xl mb-5">{fa ? 'مجله ساعت' : 'The watch journal'}</h1>
    <p className="text-gray-500 mb-12">{fa ? 'راهنما و مطالبی برای انتخاب و نگهداری ساعت شما.' : 'Guides and stories for choosing and caring for your watch.'}</p>
    {failed ? <p role="alert" className="p-8 bg-red-50 text-red-700">{fa ? 'بارگذاری مطالب انجام نشد. لطفاً دوباره تلاش کنید.' : 'Could not load articles. Please try again.'} <Link href={`/${lang}/blog`} className="underline">{fa ? 'تلاش دوباره' : 'Retry'}</Link></p> :
      !articles.length ? <div className="bg-gray-50 p-10"><h2 className="text-xl mb-3">{fa ? 'مطالب تازه به‌زودی منتشر می‌شوند.' : 'New articles are coming soon.'}</h2><Link href={`/${lang}/watches`} className="text-ariwatch-red underline">{fa ? 'مشاهده ساعت‌ها' : 'Explore the watches'}</Link></div> :
      <div className="grid md:grid-cols-2 gap-6">{articles.map(article => <article key={article.id} className="border border-gray-200 p-7 md:p-9">
        {article.publishedAt && <time dateTime={article.publishedAt} className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US')}</time>}
        <h2 className="text-2xl font-serif mt-3 mb-4"><Link href={`/${lang}/blog/${encodeURIComponent(article.slug)}`} className="hover:text-ariwatch-red">{article.title}</Link></h2>
        <p className="text-gray-600 leading-7 mb-6">{article.excerpt}</p><Link href={`/${lang}/blog/${encodeURIComponent(article.slug)}`} className="text-sm text-ariwatch-red underline">{fa ? 'خواندن مطلب' : 'Read article'}</Link>
      </article>)}</div>}
  </div>;
}
