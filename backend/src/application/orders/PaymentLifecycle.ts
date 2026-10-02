import type { QueryExecutor } from '../../domain/ports/Database';
import type { Database } from '../../domain/ports/Database';
import type { PaymentGateway } from '../../domain/ports/PaymentGateway';
import { HttpError } from '../errors';
import { uuid } from '../validation';
import { mapOrder, Order } from './types';
import { enqueueNotification } from '../notifications/outbox';
import { inquireAfterVerificationError } from './paymentInquiry';

export class PaymentLifecycle {
  private readonly callbacks = new Map<string, Promise<{ id: string; lang: string; paid: boolean }>>();
  constructor(private gateway: PaymentGateway, private db: Database) {}
  private callbackUrl(): string {
    const origin = process.env.API_PUBLIC_URL || 'http://localhost:4000';
    if (process.env.NODE_ENV === 'production' && (!process.env.API_PUBLIC_URL || !origin.startsWith('https://'))) throw new HttpError(503, 'Public payment callback URL is not configured');
    return `${origin.replace(/\/$/, '')}/api/payments/zarinpal/callback`;
  }
  async initialize(client: QueryExecutor, row: any, mobile: string) {
    const payment = await this.gateway.requestPayment({ orderId: row.id, amount: Number(row.total), description: `Watch shop order ${row.id}`,
      callbackUrl: this.callbackUrl(), mobile, email: row.customer.email || undefined });
    await client.query('INSERT INTO payment_attempts(authority,order_id,payment_url,amount) VALUES($1,$2,$3,$4)', [payment.authority, row.id, payment.paymentUrl, Number(row.total)]);
    const updated = await client.query('UPDATE orders SET payment_authority=$2,payment_url=$3 WHERE id=$1 RETURNING *', [row.id, payment.authority, payment.paymentUrl]);
    return { order: mapOrder(updated.rows[0]), paymentUrl: payment.paymentUrl };
  }
  async settle(client: QueryExecutor, row: any, authority: string, refId: string): Promise<Order> {
    await client.query("UPDATE payment_attempts SET status='paid',ref_id=$2 WHERE authority=$1", [authority, refId]);
    const duplicate = Boolean(row.payment_ref_id && row.payment_ref_id !== refId);
    const updated = await client.query(`UPDATE orders SET payment_ref_id=COALESCE(payment_ref_id,$2),paid_at=COALESCE(paid_at,NOW()),
      inventory_state=CASE WHEN inventory_state='reserved' THEN 'consumed' ELSE inventory_state END,
      coupon_state=CASE WHEN coupon_state='reserved' THEN 'consumed' ELSE coupon_state END,
      refund_due=CASE WHEN status='cancelled' THEN total ELSE refund_due END,
      refund_status=CASE WHEN status='cancelled' THEN 'due' ELSE refund_status END,
      payment_review=payment_review OR $3,status=CASE WHEN status IN ('confirmed','shipped','cancelled') THEN status ELSE 'paid' END
      WHERE id=$1 RETURNING *`, [row.id, refId, duplicate]);
    if (!row.payment_ref_id) {
      const owner = await client.query('SELECT mobile FROM users WHERE id=$1', [row.user_id]);
      await enqueueNotification(client, { kind: 'order_status_sms', recipient: owner.rows[0].mobile,
        payload: { orderId: row.id, status: updated.rows[0].status, lang: row.lang, refundDue: Number(updated.rows[0].refund_due) }, dedupeKey: `order:${row.id}:payment:${refId}` });
    }
    return mapOrder(updated.rows[0]);
  }

  async resume(userId: string, mobile: string, rawId: unknown) {
    return this.db.transaction(async client => {
      const result = await client.query('SELECT * FROM orders WHERE id=$1 AND user_id=$2 FOR UPDATE', [uuid(rawId), userId]);
      const row = result.rows[0];
      if (!row) throw new HttpError(404, 'Order not found');
      if (row.status === 'cancelled') throw new HttpError(409, 'This order was cancelled');
      if (row.status !== 'pending_payment') return { order: mapOrder(row), paymentUrl: null };
      if (row.payment_authority) {
        try {
          const verified = await this.gateway.verifyPayment({ authority: row.payment_authority, amount: Number(row.total) });
          return { order: await this.settle(client, row, row.payment_authority, verified.refId), paymentUrl: null };
        } catch (error: any) {
          const inquiry = await inquireAfterVerificationError(this.gateway, row.payment_authority, error);
          if (!inquiry) {
            if (row.payment_url) return { order: mapOrder(row), paymentUrl: row.payment_url };
            throw error;
          }
          if (inquiry.status === 'FAILED') {
            await client.query("UPDATE payment_attempts SET status='failed' WHERE authority=$1 AND ref_id IS NULL", [row.payment_authority]);
          } else if (inquiry.status === 'IN_BANK') {
            if (!row.payment_url) throw new HttpError(409, 'This payment is still being processed; contact the store');
            return { order: mapOrder(row), paymentUrl: row.payment_url };
          } else if (inquiry.status === 'PAID' || inquiry.status === 'VERIFIED') {
            // Inquiry is not proof of amount or settlement; a verified receipt is required.
            const verified = await this.gateway.verifyPayment({ authority: row.payment_authority, amount: Number(row.total) });
            return { order: await this.settle(client, row, row.payment_authority, verified.refId), paymentUrl: null };
          } else {
            throw new HttpError(409, 'This payment needs store review; contact the store before trying again');
          }
        }
      }
      return this.initialize(client, row, mobile);
    });
  }
  async callback(authority: unknown, success: boolean): Promise<{ id: string; lang: string; paid: boolean }> {
    if (typeof authority !== 'string' || !/^[AS][a-zA-Z0-9]{35}$/.test(authority)) throw new HttpError(400, 'Invalid payment reference');
    const key = `${authority}:${success}`;
    const existing = this.callbacks.get(key);
    if (existing) return existing;
    const work = this.verifyCallback(authority, success);
    this.callbacks.set(key, work);
    try { return await work; } finally { this.callbacks.delete(key); }
  }
  private async verifyCallback(authority: string, success: boolean): Promise<{ id: string; lang: string; paid: boolean }> {
    return this.db.transaction(async client => {
      const result = await client.query(`SELECT orders.*,payment_attempts.ref_id AS attempt_ref_id FROM orders
        JOIN payment_attempts ON payment_attempts.order_id=orders.id WHERE payment_attempts.authority=$1 FOR UPDATE OF orders,payment_attempts`, [authority]);
      const row = result.rows[0];
      if (!row) throw new HttpError(404, 'Payment order not found');
      if (row.attempt_ref_id) return { id: row.id, lang: row.lang, paid: true };
      if (!success) return { id: row.id, lang: row.lang, paid: false };
      try {
        const verified = await this.gateway.verifyPayment({ authority, amount: Number(row.total) });
        // A late payment still records the verified funds, even if an admin cancelled the pending order.
        await this.settle(client, row, authority, verified.refId);
        return { id: row.id, lang: row.lang, paid: true };
      } catch { return { id: row.id, lang: row.lang, paid: false }; }
    });
  }
}



