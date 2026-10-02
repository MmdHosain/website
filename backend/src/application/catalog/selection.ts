import { Watch } from '../../domain/entities/Watch';
import { HttpError } from '../errors';
import { timedPrice } from '../../domain/catalog/pricing';

export function activeSale(watch: Watch, now = new Date()): boolean {
  return watch.salePrice !== null && watch.salePrice > 0 && watch.salePrice < watch.price &&
    !!watch.saleStartsAt && !!watch.saleEndsAt &&
    new Date(watch.saleStartsAt).getTime() <= now.getTime() && now.getTime() < new Date(watch.saleEndsAt).getTime();
}
export function resolveWatchSelection(watch: Watch, variantId?: string, now = new Date()) {
  const variant = watch.variants.find(item => item.id === variantId);
  if (watch.variants.length && !variantId) throw new HttpError(400, 'Select a product variant');
  if (variantId && !variant) throw new HttpError(409, 'This product variant is no longer available');
  const originalPrice = variant?.price ?? watch.price;
  const isOnSale = activeSale(watch, now);
  const price = timedPrice(watch.price, originalPrice, watch.salePrice, watch.saleStartsAt, watch.saleEndsAt, now.getTime());
  return { price, originalPrice, stockQuantity: variant?.stockQuantity ?? watch.stockQuantity, isOnSale,
    ...(variant ? { variantId: variant.id, variantLabel: variant.label } : {}) };
}
