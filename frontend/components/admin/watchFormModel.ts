import { Watch, WatchVariant } from '../../types';
export interface VariantDraft extends Omit<WatchVariant, 'price' | 'stockQuantity'> { price: number | string; stockQuantity: number | string }
export interface WatchDraft {
  name: string; description: string; price: number | string; category: string; imageUrl: string;
  stockQuantity: number | string; variants: VariantDraft[]; salePrice: string; saleStartsAt: string; saleEndsAt: string;
  sku: string; features: string; metaTitle: string; metaDescription: string;
}
const localDate = (date: string | null | undefined) => {
  if (!date) return '';
  const value = new Date(date);
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};
export function watchDraft(watch?: Watch | null): WatchDraft {
  return { name: watch?.name || '', description: watch?.description || '', price: watch?.price ?? '', category: watch?.category || 'original', imageUrl: watch?.imageUrl || '',
    stockQuantity: watch?.stockQuantity ?? 20, variants: watch?.variants || [], salePrice: watch?.salePrice?.toString() || '',
    saleStartsAt: localDate(watch?.saleStartsAt), saleEndsAt: localDate(watch?.saleEndsAt),
    sku: watch?.sku || '', features: watch?.features || '', metaTitle: watch?.metaTitle || '', metaDescription: watch?.metaDescription || '' };
}
export function watchPayload(draft: WatchDraft): Omit<Watch, 'id'> {
  const price = (value: number | string) => {
    const result = Number(value);
    if (!Number.isSafeInteger(result) || result <= 0 || result > 1_000_000_000_000) throw new Error('Price must be a positive whole toman amount.');
    return result;
  };
  const stock = (value: number | string) => {
    const result = Number(value);
    if (!Number.isInteger(result) || result < 0 || result > 1_000_000) throw new Error('Stock must be an integer from 0 to 1,000,000.');
    return result;
  };
  const salePrice = draft.salePrice ? price(draft.salePrice) : null;
  const saleStartsAt = draft.saleStartsAt ? new Date(draft.saleStartsAt).toISOString() : null;
  const saleEndsAt = draft.saleEndsAt ? new Date(draft.saleEndsAt).toISOString() : null;
  const regular = price(draft.price);
  if (salePrice !== null && (salePrice >= regular || !saleStartsAt || !saleEndsAt || saleStartsAt >= saleEndsAt)) throw new Error('Sale price must be lower, and its start must precede its end.');
  let validImage = /^\/(?!\/)[^\\\s]*$/.test(draft.imageUrl.trim());
  try { validImage ||= ['http:', 'https:'].includes(new URL(draft.imageUrl.trim()).protocol); } catch { /* Local paths are accepted. */ }
  if (!validImage) throw new Error('Use an http(s) image URL or a local image path.');
  if (!draft.name.trim() || !draft.description.trim()) throw new Error('Enter the product name and description.');
  return { ...draft, name: draft.name.trim(), description: draft.description.trim(), imageUrl: draft.imageUrl.trim(),
    price: regular, stockQuantity: stock(draft.stockQuantity), salePrice, saleStartsAt, saleEndsAt, sku: draft.sku.trim() || null,
    variants: draft.variants.map(item => ({ ...item, sku: item.sku.trim().toUpperCase(), label: item.label.trim(), price: price(item.price), stockQuantity: stock(item.stockQuantity) })) };
}
