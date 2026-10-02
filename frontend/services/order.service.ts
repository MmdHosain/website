import { apiRequest } from './api';

export type OrderStatus = 'pending_payment' | 'paid' | 'confirmed' | 'shipped' | 'cancelled';
export interface OrderCustomer {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}
export interface OrderItem { watchId: string; variantId?: string; variantLabel?: string; name: string; price: number; imageUrl: string; quantity: number; }
export interface CheckoutItem { watchId: string; variantId?: string; quantity: number; }
export interface OrderQuote { items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number; currency: string; couponCode: string | null; }
export interface Order {
  id: string;
  items: OrderItem[];
  customer: OrderCustomer;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  paymentRefId?: string | null;
  paymentReview?: boolean;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  couponCode?: string | null;
  paidAt?: string | null;
  refundDue?: number;
  refundStatus?: 'none' | 'due' | 'refunded';
}
export interface CheckoutRequest { items: CheckoutItem[]; customer: OrderCustomer; lang: string; expectedTotal: number; couponCode?: string | null; }
export interface PaymentResponse { order: Order; paymentUrl: string | null; }

export function trustedPaymentUrl(raw: string | null): string {
  if (typeof raw !== 'string') throw new Error('The payment gateway returned an invalid payment link.');
  const url = new URL(raw);
  if (url.protocol !== 'https:' || !['payment.zarinpal.com', 'www.zarinpal.com', 'sandbox.zarinpal.com'].includes(url.hostname) ||
    url.port || url.username || url.password || !/^\/pg\/StartPay\/[A-Za-z0-9-]+\/?$/.test(url.pathname)) {
    throw new Error('The payment gateway returned an invalid payment link.');
  }
  return url.href;
}

export const orderService = {
  quote: (items: CheckoutItem[], couponCode?: string | null) => apiRequest<OrderQuote>('/api/checkout/quote', { method: 'POST', body: { items, couponCode } }),
  create: (request: CheckoutRequest, key: string) => apiRequest<PaymentResponse>('/api/orders', {
    method: 'POST', authenticated: true, headers: { 'Idempotency-Key': key }, body: request,
  }),
  list: () => apiRequest<Order[]>('/api/orders', { authenticated: true }),
  get: (id: string) => apiRequest<Order>(`/api/orders/${encodeURIComponent(id)}`, { authenticated: true }),
  resumePayment: (id: string) => apiRequest<PaymentResponse>(`/api/orders/${encodeURIComponent(id)}/payment`, { method: 'POST', authenticated: true }),
};
