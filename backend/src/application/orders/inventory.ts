import type { QueryExecutor } from '../../domain/ports/Database';
import { HttpError } from '../errors';
import { OrderItem } from './types';
import { enqueueRestockAlerts } from '../catalog/restock';
import { CatalogRepositoryFactory } from './catalogPort';

export async function reserveInventory(client: QueryExecutor, items: OrderItem[]): Promise<void> {
  for (const item of items) {
    const result = item.variantId
      ? await client.query('UPDATE watch_variants SET stock_quantity=stock_quantity-$2 WHERE id=$1 AND watch_id=$3 AND stock_quantity >= $2 RETURNING id', [item.variantId, item.quantity, item.watchId])
      : await client.query('UPDATE watches SET stock_quantity=stock_quantity-$2 WHERE id=$1 AND stock_quantity >= $2 RETURNING id', [item.watchId, item.quantity]);
    if (!result.rows.length) throw new HttpError(409, 'There is not enough stock for an item in your cart');
  }
}
export async function releaseInventory(client: QueryExecutor, row: any, catalog: CatalogRepositoryFactory): Promise<void> {
  if (!['reserved', 'consumed'].includes(row.inventory_state)) return;
  const ids = [...new Set((row.items as OrderItem[]).map(item => item.watchId))].sort();
  await client.query('SELECT id FROM watches WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE', [ids]);
  await client.query('SELECT id FROM watch_variants WHERE watch_id=ANY($1::uuid[]) ORDER BY id FOR UPDATE', [ids]);
  const repository = catalog(client);
  const before = new Map();
  for (const id of ids) before.set(id, await repository.findById(id));
  for (const item of row.items as OrderItem[]) {
    if (item.variantId) await client.query('UPDATE watch_variants SET stock_quantity=stock_quantity+$2 WHERE id=$1 AND watch_id=$3', [item.variantId, item.quantity, item.watchId]);
    else await client.query('UPDATE watches SET stock_quantity=stock_quantity+$2 WHERE id=$1', [item.watchId, item.quantity]);
  }
  await client.query("UPDATE orders SET inventory_state='released' WHERE id=$1", [row.id]);
  for (const id of ids) {
    const after = await repository.findById(id);
    if (before.get(id) && after) await enqueueRestockAlerts(client, before.get(id), after);
  }
}
export async function releaseCoupon(client: QueryExecutor, row: any): Promise<void> {
  if (row.coupon_state !== 'reserved' || !row.coupon_code) return;
  await client.query('UPDATE discount_codes SET used_count=GREATEST(0,used_count-1) WHERE code=$1', [row.coupon_code]);
  await client.query("UPDATE orders SET coupon_state='released' WHERE id=$1", [row.id]);
}

