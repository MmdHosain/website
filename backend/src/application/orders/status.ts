import type { QueryExecutor } from '../../domain/ports/Database';
import type { PaymentGateway } from '../../domain/ports/PaymentGateway';
import { HttpError } from '../errors';
import { uuid } from '../validation';
import { enqueueNotification } from '../notifications/outbox';
import { PaymentLifecycle } from './PaymentLifecycle';
import { releaseCoupon, releaseInventory } from './inventory';
import { mapOrder, Order, OrderStatus, validTransition } from './types';
import { CatalogRepositoryFactory } from './catalogPort';
import { inquireAfterVerificationError } from './paymentInquiry';

export async function changeOrderStatus(client: QueryExecutor, gateway: PaymentGateway, payment: PaymentLifecycle, catalog: CatalogRepositoryFactory, rawId: unknown, rawStatus: unknown): Promise<Order> {
  if (!['pending_payment', 'paid', 'confirmed', 'shipped', 'cancelled'].includes(rawStatus as string)) throw new HttpError(400, 'Invalid order status');
  const result = await client.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE', [uuid(rawId)]);
  let row = result.rows[0];
  if (!row) throw new HttpError(404, 'Order not found');
  if (row.status === rawStatus) return mapOrder(row);
  if (row.payment_review) throw new HttpError(409, 'Multiple payments require store review before fulfillment');
  if (!validTransition(row.status, rawStatus as OrderStatus)) throw new HttpError(409, 'This status transition is not allowed; payment must be verified by the gateway');
  if (row.status === 'pending_payment' && rawStatus === 'cancelled' && row.payment_authority) {
    try {
      const verified = await gateway.verifyPayment({ authority: row.payment_authority, amount: Number(row.total) });
      await payment.settle(client, row, row.payment_authority, verified.refId);
      row = (await client.query('SELECT * FROM orders WHERE id=$1', [row.id])).rows[0];
    } catch (error: any) {
      const inquiry = await inquireAfterVerificationError(gateway, row.payment_authority, error);
      if (inquiry && inquiry.status !== 'FAILED') throw new HttpError(409, 'Payment is still active; retry cancellation after it completes or fails');
    }
  }
  if (rawStatus === 'cancelled') {
    await releaseInventory(client, row, catalog);
    await releaseCoupon(client, row);
  }
  const updated = await client.query(`UPDATE orders SET status=$2::varchar,
    refund_due=CASE WHEN $2::varchar='cancelled' AND payment_ref_id IS NOT NULL THEN total ELSE refund_due END,
    refund_status=CASE WHEN $2::varchar='cancelled' AND payment_ref_id IS NOT NULL THEN 'due' ELSE refund_status END
    WHERE id=$1 RETURNING *`, [row.id, rawStatus]);
  const owner = await client.query('SELECT mobile FROM users WHERE id=$1', [row.user_id]);
  await enqueueNotification(client, { kind: 'order_status_sms', recipient: owner.rows[0].mobile,
    payload: { orderId: row.id, status: rawStatus, lang: row.lang, refundDue: Number(updated.rows[0].refund_due) }, dedupeKey: `order:${row.id}:status:${rawStatus}` });
  return mapOrder(updated.rows[0]);
}

