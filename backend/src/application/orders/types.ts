import { Customer } from './input';
export type OrderStatus = 'pending_payment' | 'paid' | 'confirmed' | 'shipped' | 'cancelled';
export interface OrderItem {
  watchId: string; variantId?: string; variantLabel?: string; name: string; price: number;
  imageUrl: string; quantity: number; category?: string;
}
export interface Quote { items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number; currency: 'IRT'; couponCode: string | null; }
export interface Order extends Quote {
  id: string; customer: Customer; status: OrderStatus; createdAt: string; paidAt: string | null;
  paymentRefId: string | null; paymentReview: boolean; customerMobile?: string; paymentReferences?: string[];
  refundDue: number; refundStatus: 'none' | 'due' | 'refunded';
}
export function mapOrder(row: any): Order {
  return { id: row.id, items: row.items, customer: row.customer, subtotal: Number(row.subtotal ?? row.total),
    discount: Number(row.discount || 0), shipping: Number(row.shipping || 0), total: Number(row.total), currency: row.currency,
    couponCode: row.coupon_code || null, status: row.status, createdAt: new Date(row.created_at).toISOString(),
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null, refundDue: Number(row.refund_due || 0), refundStatus: row.refund_status || 'none',
    paymentRefId: row.payment_ref_id || null, paymentReview: Boolean(row.payment_review),
    ...(row.customer_mobile ? { customerMobile: row.customer_mobile } : {}), ...(row.payment_references ? { paymentReferences: row.payment_references } : {}) };
}
export function validTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ({ pending_payment: ['cancelled'], paid: ['confirmed', 'cancelled'], confirmed: ['shipped', 'cancelled'], shipped: [], cancelled: [] } as Record<OrderStatus, OrderStatus[]>)[from].includes(to);
}
