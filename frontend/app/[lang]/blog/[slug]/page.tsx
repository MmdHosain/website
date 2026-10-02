import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogService } from '../../../../services/blog.service';
import { articleMetadata, safeJsonLd, siteUrl } from '../../../../services/seo';
import { watchService } from '../../../../services/watch.service';
import { getDictionary } from '../../../dictionaries';
import { BlogComments } from '../../../../components/blog/BlogComments';
import { BlogProduct } from '../../../../components/blog/BlogProduct';
type Props = { params:Promise<{ lang:string; slug:string }> };
export async function generateMetadata({ params }:Props) {
  const { lang:raw,slug } = await params, lang = raw === 'en' ? 'en' : 'fa';
  const article = await blogService.detail(slug,lang);
  return article ? articleMetadata(article,lang) : { title:lang === 'fa' ? 'مطلب یافت نشد' : 'Article not found',robots:{ index:false } };
}
export default async function ArticlePage({ params }:Props) {
  const { lang:raw,slug } = await params, lang = raw === 'en' ? 'en' : 'fa', fa = lang === 'fa';
  const article = await blogService.detail(slug,lang); if (!article) notFound();
  const products = new Map(await Promise.all(article.blocks.filter(block => block.type === 'product').map(async block =>
    [block.watchId,await watchService.getById(block.watchId).catch(() => null)] as const)));
  const dict = await getDictionary(lang);
  return <article className="pt-28 md:pt-36 pb-24 px-6 max-w-3xl mx-auto">
    <Link href={`/${lang}/blog`} className="text-sm text-ariwatch-red underline">{fa ? 'بازگشت به مجله' : 'Back to the journal'}</Link>
    <h1 className="font-serif text-3xl md:text-5xl leading-tight mt-8 mb-6">{article.title}</h1>
    <p className="text-lg text-gray-500 leading-8 mb-5">{article.excerpt}</p>
    {article.publishedAt && <time dateTime={article.publishedAt} className="text-xs text-gray-500">{new Date(article.publishedAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US')}</time>}
    <div className="mt-10 space-y-7 leading-8 text-gray-700">{article.blocks.map((block,index) => block.type === 'text' ?
      <p key={index} className="whitespace-pre-wrap break-words">{block.text}</p> : products.get(block.watchId) ? <BlogProduct key={index} lang={lang} watch={products.get(block.watchId)!} /> :
      <p key={index} className="text-sm text-gray-500">{fa ? 'این محصول اکنون در دسترس نیست.' : 'This product is currently unavailable.'}</p>)}</div>
    <BlogComments id={article.id} slug={article.slug} lang={lang} dict={dict} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:safeJsonLd({ '@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.excerpt,
      inLanguage:lang,datePublished:article.publishedAt,dateModified:article.updatedAt,mainEntityOfPage:`${siteUrl()}/${lang}/blog/${encodeURIComponent(article.slug)}`,publisher:{ '@type':'Organization',name:'Ariwatch' } }) }} />
  </article>;
}
