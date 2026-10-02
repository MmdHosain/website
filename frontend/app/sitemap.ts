import type { MetadataRoute } from 'next';
import { siteUrl } from '../services/seo';
import { watchService } from '../services/watch.service';
import { blogService } from '../services/blog.service';
export const dynamic = 'force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  const [products,english,persian] = await Promise.allSettled([watchService.getAll(),blogService.list('en'),blogService.list('fa')]);
  const watches = products.status === 'fulfilled' ? products.value : [];
  const result:MetadataRoute.Sitemap = [];
  for (const lang of ['en','fa']) {
    for (const path of ['', '/watches','/blog','/story','/support','/concierge']) result.push({ url:`${siteUrl()}/${lang}${path}`,changeFrequency:'weekly',priority:path === '' ? 1 : 0.7 });
    for (const watch of watches) result.push({ url:`${siteUrl()}/${lang}/watches/${watch.id}`,changeFrequency:'daily',priority:0.8 });
  }
  for (const response of [english,persian]) if (response.status === 'fulfilled') for (const article of response.value)
    result.push({ url:`${siteUrl()}/${article.lang}/blog/${encodeURIComponent(article.slug)}`,lastModified:article.updatedAt,changeFrequency:'monthly',priority:0.6 });
  return result;
}
