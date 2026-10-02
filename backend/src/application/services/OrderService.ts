import { createHash, randomUUID } from 'crypto';
import type { Database } from '../../domain/ports/Database';
import type { PaymentGateway } from '../../domain/ports/PaymentGateway';
import { HttpError } from '../errors';
import { uuid, text } from '../validation';
import { orderInput, quoteInput } from '../orders/input';
import { mapOrder, Order } from '../orders/types';
import { quoteOrder } from '../orders/quote';
import { reserveInventory } from '../orders/inventory';
import { PaymentLifecycle } from '../orders/PaymentLifecycle';
import { changeOrderStatus } from '../orders/status';
import { enqueueNotification } from '../notifications/outbox';
import { CatalogRepositoryFactory } from '../orders/catalogPort';
export { mapOrder, validTransition } from '../orders/types';
export type { Order, OrderStatus } from '../orders/types';

export class OrderService {
  private payment: PaymentLifecycle;
  constructor(private gateway: PaymentGateway, private db: Database, private catalog: CatalogRepositoryFactory) { this.payment = new PaymentLifecycle(gateway, db); }
  async quote(body: unknown) { return this.db.transaction(client => quoteOrder(client, quoteInput(body), this.catalog)); }
  async create(userId: string, mobile: string, rawKey: unknown, body: unknown): Promise<{ order: Order; paymentUrl: string | null; replayed: boolean }> {
    const key = uuid(rawKey, 'Idempotency-Key', true);
    const input = orderInput(body);
    const requestHash = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    return this.db.transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`order:${userId}:${key}`]);
      const existing = await client.query('SELECT * FROM orders WHERE user_id=$1 AND idempotency_key=$2 FOR UPDATE', [userId, key]);
      if (existing.rows.length) {
        const row = existing.rows[0];
        if (row.request_hash !== requestHash) throw new HttpError(409, 'This checkout key was already used for a different order');
        if (row.status === 'cancelled') throw new HttpError(409, 'This order was cancelled; start a new checkout');
        if (row.status !== 'pending_payment') return { order: mapOrder(row), paymentUrl: null, replayed: true };
        if (row.payment_url) return { order: mapOrder(row), paymentUrl: row.payment_url, replayed: true };
        return { ...await this.payment.initialize(client, row, mobile), replayed: true };
      }
      const quote = await quoteOrder(client, input, this.catalog, true);
      if (input.expectedTotal !== undefined && input.expectedTotal !== quote.total) throw new HttpError(409, 'Prices have changed. Please review your cart and try again.');
      await reserveInventory(client, quote.items);
      if (quote.couponCode) await client.query('UPDATE discount_codes SET used_count=used_count+1 WHERE code=$1', [quote.couponCode]);
      const result = await client.query(`INSERT INTO orders(id,user_id,idempotency_key,request_hash,items,customer,total,currency,status,lang,
        subtotal,discount,shipping,coupon_code,coupon_state,inventory_state)
        VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,'IRT','pending_payment',$8,$9,$10,$11,$12,$13,'reserved') RETURNING *`,
      [randomUUID(), userId, key, requestHash, JSON.stringify(quote.items), JSON.stringify(input.customer), quote.total, input.lang,
        quote.subtotal,quote.discount,quote.shipping,quote.couponCode,quote.couponCode ? 'reserved' : 'none']);
      const initialized = await this.payment.initialize(client, result.rows[0], mobile);
      await enqueueNotification(client, { kind: 'order_status_sms', recipient: mobile, payload: { orderId: initialized.order.id, status: 'pending_payment', lang: input.lang }, dedupeKey: `order:${initialized.order.id}:status:pending_payment` });
      await enqueueNotification(client, { kind: 'new_order_telegram', recipient: 'admin', payload: { orderId: initialized.order.id, total: initialized.order.total }, dedupeKey: `new-order:${initialized.order.id}` });
      return { ...initialized, replayed: false };
    });
  }
  async list(userId?: string): Promise<Order[]> {
    const result = await this.db.query(userId ? 'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC LIMIT 500' : `SELECT orders.*,users.mobile AS customer_mobile,
      COALESCE((SELECT jsonb_agg(ref_id ORDER BY created_at) FROM payment_attempts WHERE order_id=orders.id AND ref_id IS NOT NULL),'[]'::jsonb) AS payment_references
      FROM orders JOIN users ON users.id=orders.user_id ORDER BY orders.created_at DESC LIMIT 500`, userId ? [userId] : []);
    return result.rows.map(mapOrder);
  }
  async detail(userId: string, rawId: unknown): Promise<Order> {
    const result = await this.db.query('SELECT * FROM orders WHERE id=$1 AND user_id=$2', [uuid(rawId), userId]);
    if (!result.rows.length) throw new HttpError(404, 'Order not found');
    return mapOrder(result.rows[0]);
  }
  resume(userId: string, mobile: string, id: unknown) { return this.payment.resume(userId, mobile, id); }
  callback(authority: unknown, success: boolean) { return this.payment.callback(authority, success); }
  setStatus(id: unknown, status: unknown) { return this.db.transaction(client => changeOrderStatus(client, this.gateway, this.payment, this.catalog, id, status)); }
  async markRefunded(id: unknown, reference: unknown): Promise<Order> {
    const receipt = text(reference, 'Manual refund reference', 200, 3);
    const result = await this.db.query("UPDATE orders SET refund_status='refunded',refund_reference=$2,refund_completed_at=NOW() WHERE id=$1 AND refund_status='due' RETURNING *", [uuid(id), receipt]);
    if (!result.rows.length) throw new HttpError(409, 'No manual refund is due for this order');
    return mapOrder(result.rows[0]);
  }
}

