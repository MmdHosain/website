import { HttpError } from '../errors';
import { digits, email, language, object, text, uuid } from '../validation';
import { couponCode } from '../commerce/discounts';

export interface Customer { name: string; email: string; address: string; city: string; postalCode: string; notes: string; }
export interface SelectedItem { watchId: string; variantId?: string; quantity: number; }
export interface QuoteInput { items: SelectedItem[]; couponCode: string | null; }
export interface OrderInput extends QuoteInput { customer: Customer; lang: 'en' | 'fa'; expectedTotal?: number; }
export function quoteInput(value: unknown): QuoteInput {
  const input = object(value);
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 50) throw new HttpError(400, 'Order must contain 1-50 items');
  const seen = new Set<string>();
  const items = input.items.map(item => {
    const row = object(item);
    const watchId = uuid(row.watchId, 'Watch ID');
    const variantId = row.variantId === undefined ? undefined : uuid(row.variantId, 'Variant ID');
    const key = `${watchId}:${variantId || 'base'}`;
    if (seen.has(key)) throw new HttpError(400, 'Duplicate watch items are not allowed');
    seen.add(key);
    if (typeof row.quantity !== 'number' || !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 20) throw new HttpError(400, 'Quantity must be an integer from 1 to 20');
    return { watchId, ...(variantId ? { variantId } : {}), quantity: row.quantity };
  }).sort((a, b) => `${a.watchId}:${a.variantId || ''}`.localeCompare(`${b.watchId}:${b.variantId || ''}`));
  return { items, couponCode: couponCode(input.couponCode) };
}
export function orderInput(value: unknown): OrderInput {
  const input = object(value);
  const customer = object(input.customer);
  const postalCode = digits(text(customer.postalCode, 'Postal code', 10));
  if (!/^\d{10}$/.test(postalCode)) throw new HttpError(400, 'Postal code must contain 10 digits');
  if (input.expectedTotal !== undefined && (typeof input.expectedTotal !== 'number' || !Number.isSafeInteger(input.expectedTotal) || input.expectedTotal <= 0)) throw new HttpError(400, 'Expected total must be a positive whole toman amount');
  return { ...quoteInput(input), customer: {
    name: text(customer.name, 'Name', 120, 2), email: customer.email === undefined || customer.email === '' ? '' : email(customer.email),
    address: text(customer.address, 'Address', 1000, 10), city: text(customer.city, 'City', 120, 2),
    postalCode, notes: customer.notes === undefined ? '' : text(customer.notes, 'Notes', 1000, 0),
  }, lang: language(input.lang), ...(input.expectedTotal === undefined ? {} : { expectedTotal: input.expectedTotal as number }) };
}
