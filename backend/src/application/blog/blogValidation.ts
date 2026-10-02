import { HttpError } from '../errors';
import { language, object, text, uuid } from '../validation';

export type BlogBlock = { type: 'text'; text: string } | { type: 'product'; watchId: string };
export interface ArticleInput { lang: 'en' | 'fa'; title: string; slug: string; excerpt: string; status: 'draft' | 'published'; blocks: BlogBlock[]; }
export function articleInput(value: unknown): ArticleInput {
  const input = object(value);
  const slug = text(input.slug, 'Slug', 180).toLowerCase();
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) throw new HttpError(400, 'Slug must contain letters, numbers and single hyphens');
  if (!['draft', 'published'].includes(input.status as string)) throw new HttpError(400, 'Article status must be draft or published');
  if (!Array.isArray(input.blocks) || !input.blocks.length || input.blocks.length > 80) throw new HttpError(400, 'Use 1-80 content blocks');
  const blocks = input.blocks.map(raw => {
    const block = object(raw);
    if (block.type === 'text') return { type: 'text' as const, text: text(block.text, 'Text block', 10000) };
    if (block.type === 'product') return { type: 'product' as const, watchId: uuid(block.watchId, 'Product ID') };
    throw new HttpError(400, 'Content blocks must be text or product');
  });
  if (JSON.stringify(blocks).length > 50000) throw new HttpError(400, 'Article content is too long');
  return { lang: language(input.lang), title: text(input.title, 'Title', 160), slug,
    excerpt: text(input.excerpt, 'Excerpt', 320), status: input.status as ArticleInput['status'], blocks };
}
export const articleSummary = (row: any) => ({ id: row.id, lang: row.lang, title: row.title, slug: row.slug,
  excerpt: row.excerpt, status: row.status, publishedAt: row.published_at, createdAt: row.created_at, updatedAt: row.updated_at });
export const mapArticle = (row: any) => ({ ...articleSummary(row), blocks: row.blocks });
export const mapComment = (row: any) => ({ id: row.id, articleId: row.article_id, name: row.name, body: row.body, status: row.status, createdAt: row.created_at,
  ...(row.article_title ? { articleTitle: row.article_title } : {}) });
