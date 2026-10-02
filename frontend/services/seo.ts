import type { Metadata } from 'next';
import { Watch } from '../types';
import { BlogArticle } from './blog.service';
import { displayPrice, productStock, selectedPrice } from './catalog/pricing';
import { localMediaUrl } from './media';
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/,'');
export function pageMetadata(lang:string,path:string,title:string,description:string):Metadata {
  const url = `${siteUrl()}/${lang}${path}`;
  return { title,description,metadataBase:new URL(siteUrl()),alternates:{ canonical:url },
    openGraph:{ title,description,url,siteName:'Ariwatch',locale:lang === 'fa' ? 'fa_IR' : 'en_US',type:'website' },
    twitter:{ card:'summary',title,description } };
}
export function watchMetadata(watch:Watch,lang:string):Metadata {
  const data = watch as Watch & { metaTitle?:string; metaDescription?:string; features?:string };
  return { ...pageMetadata(lang,`/watches/${watch.id}`,data.metaTitle || `${watch.name} | Ariwatch`,data.metaDescription || `${watch.name}. ${data.features || watch.description}`.slice(0,320)),
    openGraph:{ title:data.metaTitle || watch.name,description:data.metaDescription || watch.description.slice(0,320),images:[localMediaUrl(watch.imageUrl)] } };
}
export function articleMetadata(article:BlogArticle,lang:string):Metadata {
  return { ...pageMetadata(lang,`/blog/${encodeURIComponent(article.slug)}`,`${article.title} | Ariwatch`,article.excerpt),
    openGraph:{ type:'article',title:article.title,description:article.excerpt,publishedTime:article.publishedAt || undefined,modifiedTime:article.updatedAt } };
}
export const safeJsonLd = (value:unknown) => JSON.stringify(value).replace(/</g,'\\u003c');
export function watchJsonLd(watch:Watch,lang:string) {
  const url=`${siteUrl()}/${lang}/watches/${watch.id}`,prices=(watch.variants?.length ? watch.variants.map(variant=>selectedPrice(watch,variant.id).price) : [displayPrice(watch).price]);
  return { '@context':'https://schema.org','@type':'Product',name:watch.name,description:watch.description,image:new URL(localMediaUrl(watch.imageUrl),siteUrl()).href,url,
    ...(watch.sku ? { sku:watch.sku } : {}),offers:{ '@type':'AggregateOffer',url,priceCurrency:'IRR',lowPrice:Math.min(...prices)*10,highPrice:Math.max(...prices)*10,
      offerCount:prices.length,availability:`https://schema.org/${productStock(watch)>0 ? 'InStock' : 'OutOfStock'}` } };
}
