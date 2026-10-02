import type { Database } from '../../domain/ports/Database';
import { HttpError } from '../errors';
import { timedPrice } from '../../domain/catalog/pricing';

export interface FeedProduct {
  page_unique: string; page_url: string; product_group_id: string; title: string;
  current_price: number; old_price?: number; availability: boolean; category_name: string;
  image_links: string[]; spec: Record<string, string>; short_desc: string; date_added: string; date_updated: string;
}
export async function catalogFeed(db: Database, origin: string): Promise<FeedProduct[]> {
  const result = await db.query(`SELECT w.*,COALESCE((SELECT jsonb_agg(v ORDER BY v.id) FROM watch_variants v WHERE v.watch_id=w.id),'[]'::jsonb) AS variants FROM watches w WHERE category<>'custom'`);
  return result.rows.flatMap(row => {
    const variants = row.variants.length ? row.variants : [null];
    return variants.map((variant: any) => {
      const price = Number(variant?.price ?? row.price);
      const current = timedPrice(Number(row.price), price, row.sale_price === null ? null : Number(row.sale_price), row.sale_starts_at, row.sale_ends_at);
      const available = Number(variant?.stock_quantity ?? row.stock_quantity) > 0;
      return { page_unique: variant?.id || row.id, product_group_id: row.id,
        page_url: `${origin.replace(/\/$/, '')}/fa/watches/${row.id}${variant ? `?variant=${variant.id}` : ''}`,
        title: `${row.name}${variant ? ` — ${variant.label}` : ''}`, current_price: available ? current : 0,
        ...(current < price ? { old_price: price } : {}), availability: available, category_name: row.category,
        image_links: [row.image_url.startsWith('/') ? `${origin.replace(/\/$/, '')}${row.image_url}` : row.image_url],
        spec: variant ? { model: String(variant.label), color: String(variant.color || '') } : {}, short_desc: row.description.slice(0, 500),
        date_added: new Date(row.created_at).toISOString(), date_updated: new Date(row.updated_at).toISOString() };
    });
  });
}

export function selectFeed(products: FeedProduct[], body: any) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Invalid feed request');
  const modes = ['page_urls', 'page_uniques', 'page', 'cursor'].filter(key => body[key] !== undefined);
  if (modes.length > 1 || body.limit !== undefined || body.size !== undefined) throw new HttpError(400, 'Use one feed selection mode');
  let selected: FeedProduct[], page = 1, total: number | null = products.length, maxPages: number | null = Math.max(1, Math.ceil(products.length / 100)), nextCursor: string | null = null;
  if (body.page_urls !== undefined || body.page_uniques !== undefined) {
    const values = body.page_urls ?? body.page_uniques;
    if (!Array.isArray(values) || !values.length || values.length > 100 || values.some(v => typeof v !== 'string')) throw new HttpError(400, 'Invalid product identifiers');
    selected = products.filter(p => values.includes(body.page_urls ? p.page_url : p.page_unique));
    total = selected.length; maxPages = 1;
  } else {
    if (!['date_added_desc', 'date_updated_desc', 'product_id_desc'].includes(body.sort)) throw new HttpError(400, 'sort parameter is not provided or invalid');
    const field = body.sort === 'product_id_desc' ? 'page_unique' : body.sort === 'date_added_desc' ? 'date_added' : 'date_updated';
    const sorted = [...products].sort((a, b) => b[field].localeCompare(a[field]) || b.page_unique.localeCompare(a.page_unique));
    if (body.page !== undefined) {
      if (!Number.isSafeInteger(body.page) || body.page < 1) throw new HttpError(400, 'Invalid page');
      page = body.page; selected = sorted.slice((page - 1) * 100, page * 100);
    } else {
      if (body.sort !== 'product_id_desc' || (body.cursor !== undefined && (typeof body.cursor !== 'string' || !sorted.some(p => p.page_unique === body.cursor)))) throw new HttpError(400, 'Invalid cursor pagination');
      const start = body.cursor ? sorted.findIndex(p => p.page_unique === body.cursor) + 1 : 0;
      selected = sorted.slice(start, start + 100); total = null; maxPages = null;
      nextCursor = start + 100 < sorted.length ? selected[selected.length - 1].page_unique : null;
    }
  }
  return { api_version: 'torob_api_v3', current_page: page, total, max_pages: maxPages, next_cursor: nextCursor, products: selected };
}
