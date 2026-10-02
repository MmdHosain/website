import { Watch } from '../../types';

export function saleActive(watch: Watch, now = Date.now()) {
  return typeof watch.salePrice === 'number' && watch.salePrice > 0 && watch.salePrice < watch.price &&
    !!watch.saleStartsAt && !!watch.saleEndsAt && new Date(watch.saleStartsAt).getTime() <= now && now < new Date(watch.saleEndsAt).getTime();
}
export function selectedPrice(watch: Watch, variantId?: string, now = Date.now()) {
  const originalPrice = watch.variants?.find(item => item.id === variantId)?.price ?? watch.price;
  const onSale = saleActive(watch, now);
  return { price: onSale ? Math.max(1, Math.round(originalPrice * watch.salePrice! / watch.price)) : originalPrice, originalPrice, onSale };
}
export function productStock(watch: Watch) {
  return watch.variants?.length ? watch.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0) : watch.stockQuantity ?? 20;
}
export function displayPrice(watch: Watch, now = Date.now()) {
  const variants = watch.variants || [];
  if (!variants.length) return selectedPrice(watch, undefined, now);
  const cheapest = variants.reduce((best, item) => item.price < best.price ? item : best, variants[0]);
  return selectedPrice(watch, cheapest.id, now);
}
