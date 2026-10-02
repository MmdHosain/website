import { Watch } from '../../types';
import { selectedPrice } from './pricing';
export interface CartItem extends Watch { lineId: string; variantId?: string; variantLabel?: string; quantity: number; }
export const cartLineId = (watchId: string, variantId?: string) => `${watchId}:${variantId || 'base'}`;
export const clampQuantity = (quantity: number, stock = 10) => Math.max(1, Math.min(10, Math.max(1, stock), Math.trunc(quantity) || 1));
export function makeCartItem(watch: Watch, variantId?: string, quantity = 1): CartItem | null {
  const variant = watch.variants?.find(item => item.id === variantId);
  if ((watch.variants?.length && !variant) || (variantId && !variant) || watch.category === 'custom') return null;
  const stockQuantity = variant?.stockQuantity ?? watch.stockQuantity ?? 20;
  if (stockQuantity < 1) return null;
  return { ...watch, price: selectedPrice(watch, variantId).price, stockQuantity, lineId: cartLineId(watch.id, variantId),
    ...(variant ? { variantId: variant.id, variantLabel: variant.label } : {}), quantity: clampQuantity(quantity, stockQuantity) };
}
export function refreshCart(items: CartItem[], watches: Watch[]): CartItem[] {
  return items.map(item => {
    const watch = watches.find(product => product.id === item.id);
    return watch ? makeCartItem(watch, item.variantId, item.quantity) || { ...item, stockQuantity: 0 } : { ...item, stockQuantity: 0 };
  });
}
export function consumeCart(items: CartItem[], purchased: { watchId: string; variantId?: string; quantity: number }[]) {
  return items.flatMap(item => {
    const bought = purchased.find(row => cartLineId(row.watchId, row.variantId) === item.lineId)?.quantity || 0;
    return item.quantity > bought ? [{ ...item, quantity: item.quantity - bought }] : [];
  });
}
export function parseCart(raw: string): CartItem[] {
  try {
    const stored: unknown = JSON.parse(raw);
    if (!Array.isArray(stored)) return [];
    const seen = new Set<string>();
    return stored.flatMap(item => {
      if (!item || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.description !== 'string' ||
        typeof item.imageUrl !== 'string' || typeof item.category !== 'string' || !Number.isFinite(item.price) || item.price <= 0 ||
        (item.variantId !== undefined && typeof item.variantId !== 'string')) return [];
      const lineId = cartLineId(item.id, item.variantId);
      if (seen.has(lineId)) return [];
      seen.add(lineId);
      return [{ ...item, lineId, variants: Array.isArray(item.variants) ? item.variants : [], stockQuantity: Number.isInteger(item.stockQuantity) ? Math.max(0, item.stockQuantity) : 20,
        salePrice: item.salePrice ?? null, saleStartsAt: item.saleStartsAt ?? null, saleEndsAt: item.saleEndsAt ?? null, quantity: clampQuantity(Number(item.quantity)) }];
    });
  } catch { return []; }
}
