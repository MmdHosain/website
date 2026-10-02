import type { QueryExecutor } from '../../domain/ports/Database';
import { HttpError } from '../errors';
import { resolveWatchSelection } from '../catalog/selection';
import { resolveDiscount } from '../commerce/discounts';
import { QuoteInput } from './input';
import { Quote } from './types';
import { CatalogRepositoryFactory } from './catalogPort';

export async function quoteOrder(client: QueryExecutor, input: QuoteInput, catalog: CatalogRepositoryFactory, lock = false): Promise<Quote> {
  const ids = [...new Set(input.items.map(item => item.watchId))].sort();
  if (lock) {
    await client.query('SELECT id FROM watches WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE', [ids]);
    await client.query('SELECT id FROM watch_variants WHERE watch_id=ANY($1::uuid[]) ORDER BY id FOR UPDATE', [ids]);
  }
  const repository = catalog(client);
  const items = [];
  for (const selected of input.items) {
    const watch = await repository.findById(selected.watchId);
    if (!watch) throw new HttpError(409, 'A watch in your cart is no longer available');
    if (watch.category === 'custom') throw new HttpError(400, 'Custom watches require a concierge inquiry');
    const resolved = resolveWatchSelection(watch, selected.variantId);
    if (resolved.stockQuantity < selected.quantity) throw new HttpError(409, 'There is not enough stock for an item in your cart');
    items.push({ watchId: watch.id, name: watch.name, price: resolved.price, imageUrl: watch.imageUrl, quantity: selected.quantity,
      category: watch.category, ...(resolved.variantId ? { variantId: resolved.variantId, variantLabel: resolved.variantLabel } : {}) });
  }
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = await resolveDiscount(client, input.couponCode, subtotal, lock);
  const settings = await client.query('SELECT shipping_cost FROM store_settings WHERE id=TRUE');
  const shipping = Number(settings.rows[0]?.shipping_cost || 0);
  const total = subtotal - discount + shipping;
  if (!Number.isSafeInteger(total) || total < 1000 || total > 100_000_000) throw new HttpError(400, 'Online orders must total between 1,000 and 100,000,000 toman; contact concierge for larger purchases');
  return { items, subtotal, discount, shipping, total, currency: 'IRT', couponCode: input.couponCode };
}

