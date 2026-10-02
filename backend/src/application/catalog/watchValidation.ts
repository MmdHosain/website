import { randomUUID } from 'crypto';
import { HttpError } from '../errors';

const fail = (message: string): never => { throw new HttpError(400, message); };
const string = (value: unknown, label: string, max: number) =>
  typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : fail(`${label} is required (maximum ${max} characters)`);
const amount = (value: unknown, label: string) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 1_000_000_000_000 ? value : fail(`${label} must be a positive whole toman amount`);
const stock = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 1_000_000 ? value : fail('Stock must be an integer from 0 to 1,000,000');
const date = (value: unknown, label: string) => value === null || value === '' ? null :
  typeof value === 'string' && Number.isFinite(new Date(value).getTime()) ? new Date(value).toISOString() : fail(`${label} must be a valid date`);

export function watchData(value: unknown, partial = false): Record<string, any> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('A JSON object is required');
  const input = value as Record<string, unknown>;
  const result: Record<string, any> = {};
  if (!partial || input.sku !== undefined) result.sku = input.sku ? string(input.sku, 'SKU', 100).toUpperCase() : null;
  for (const [key, max] of [['features', 5000], ['metaTitle', 160], ['metaDescription', 320]] as const) {
    if (!partial || input[key] !== undefined) {
      const value = input[key] ?? '';
      if (typeof value !== 'string' || value.trim().length > max) fail(`${key} must contain at most ${max} characters`);
      result[key] = (value as string).trim();
    }
  }
  for (const [key, max] of [['name', 255], ['description', 5000]] as const) {
    if (!partial || input[key] !== undefined) result[key] = string(input[key], key, max);
  }
  if (!partial || input.price !== undefined) result.price = amount(input.price, 'Price');
  if (!partial || input.imageUrl !== undefined) {
    const url = string(input.imageUrl, 'Image URL', 2048);
    let allowed = url.startsWith('/') && !url.startsWith('//') && !/[\\\s]/.test(url);
    try { allowed ||= ['https:', 'http:'].includes(new URL(url).protocol); } catch { /* Local paths need no URL parsing. */ }
    if (!allowed) fail('Image URL must be a local path or use http or https');
    result.imageUrl = url;
  }
  if (!partial || input.category !== undefined) {
    const category = input.category ?? 'original';
    if (!['original', 'highcopy', 'custom'].includes(category as string)) fail('Invalid watch category');
    result.category = category;
  }
  if (!partial || input.stockQuantity !== undefined) result.stockQuantity = stock(input.stockQuantity ?? 20);
  if (!partial || input.variants !== undefined) {
    if (input.variants !== undefined && (!Array.isArray(input.variants) || input.variants.length > 30)) fail('Use at most 30 product variants');
    const ids = new Set<string>(), skus = new Set<string>();
    result.variants = ((input.variants || []) as unknown[]).map(raw => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) fail('Invalid product variant');
      const row = raw as Record<string, unknown>;
      const id = row.id === undefined || row.id === '' ? randomUUID() : string(row.id, 'Variant ID', 36).toLowerCase();
      if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id) || ids.has(id)) fail('Variant IDs must be unique UUIDs');
      const sku = string(row.sku, 'SKU', 100).toUpperCase();
      if (skus.has(sku)) fail('Variant SKUs must be unique');
      ids.add(id); skus.add(sku);
      return { id, sku, label: string(row.label, 'Variant label', 150),
        ...(row.color ? { color: string(row.color, 'Color', 100) } : {}),
        price: amount(row.price, 'Variant price'), stockQuantity: stock(row.stockQuantity ?? 0) };
    });
  }
  for (const key of ['salePrice', 'saleStartsAt', 'saleEndsAt'] as const) {
    if (!partial || input[key] !== undefined) result[key] = input[key] === undefined || input[key] === null || input[key] === '' ? null :
      key === 'salePrice' ? amount(input[key], 'Sale price') : date(input[key], key);
  }
  if (!partial && result.salePrice !== null) {
    if (result.salePrice >= result.price) fail('Sale price must be below the regular price');
    if (!result.saleStartsAt || !result.saleEndsAt || result.saleStartsAt >= result.saleEndsAt) fail('Sale start must precede sale end');
  }
  if (partial && !Object.keys(result).length) fail('At least one watch field is required');
  return result;
}
