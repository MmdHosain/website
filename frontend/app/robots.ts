import type { MetadataRoute } from 'next';
import { siteUrl } from '../services/seo';
export default function robots():MetadataRoute.Robots {
  return { rules:{ userAgent:'*',allow:'/',disallow:['/en/admin','/fa/admin','/en/checkout','/fa/checkout','/en/orders','/fa/orders','/api/'] },sitemap:`${siteUrl()}/sitemap.xml` };
}
