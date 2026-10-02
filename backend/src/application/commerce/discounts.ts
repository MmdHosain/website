import type { QueryExecutor } from '../../domain/ports/Database';
import { HttpError } from '../errors';
import { object, text } from '../validation';

export function couponCode(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const code = text(value, 'Coupon code', 40).toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(code)) throw new HttpError(400, 'Coupon codes use letters, digits, hyphens or underscores');
  return code;
}
export function money(value: unknown, label: string, nullable = false): number | null {
  if (nullable && (value === null || value === undefined || value === '')) return null;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0 || value > 100_000_000) throw new HttpError(400, `${label} must be a whole toman amount from 0 to 100,000,000`);
  return value;
}
export function discountInput(value: unknown) {
  const body = object(value);
  const code = couponCode(body.code);
  if (!code) throw new HttpError(400, 'Coupon code is required');
  if (!['percentage', 'fixed'].includes(body.type as string)) throw new HttpError(400, 'Discount type must be percentage or fixed');
  if (typeof body.value !== 'number' || !Number.isFinite(body.value) || body.value <= 0 ||
    (body.type === 'percentage' ? body.value > 100 : !Number.isSafeInteger(body.value) || body.value > 100_000_000)) throw new HttpError(400, 'Invalid discount value');
  const startsAt = new Date(text(body.startsAt, 'Start date', 40));
  const endsAt = new Date(text(body.endsAt, 'End date', 40));
  if (!Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) throw new HttpError(400, 'Coupon end date must follow its start date');
  const minimumAmount = money(body.minimumAmount ?? 0, 'Minimum amount')!;
  const maximumAmount = money(body.maximumAmount, 'Maximum amount', true);
  if (maximumAmount !== null && maximumAmount < minimumAmount) throw new HttpError(400, 'Maximum amount must be at least the minimum amount');
  const maximumDiscount = money(body.maximumDiscount, 'Maximum discount', true);
  const usageLimit = body.usageLimit ?? null;
  if (usageLimit !== null && (typeof usageLimit !== 'number' || !Number.isInteger(usageLimit) || usageLimit < 1 || usageLimit > 1000000)) throw new HttpError(400, 'Usage limit must be a positive integer');
  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') throw new HttpError(400, 'Enabled must be boolean');
  return { code, type: body.type, value: body.value, minimumAmount, maximumAmount, maximumDiscount, startsAt, endsAt, usageLimit, enabled: body.enabled ?? true };
}
export function mapDiscount(row: any) {
  return { id: row.id, code: row.code, type: row.type, value: Number(row.value), minimumAmount: Number(row.minimum_amount),
    maximumAmount: row.maximum_amount === null ? null : Number(row.maximum_amount), maximumDiscount: row.maximum_discount === null ? null : Number(row.maximum_discount),
    startsAt: new Date(row.starts_at).toISOString(), endsAt: new Date(row.ends_at).toISOString(), usageLimit: row.usage_limit, usedCount: row.used_count, enabled: row.enabled };
}
export async function resolveDiscount(client: QueryExecutor, code: string | null, subtotal: number, lock = false): Promise<number> {
  if (!code) return 0;
  const result = await client.query(`SELECT * FROM discount_codes WHERE code=$1${lock ? ' FOR UPDATE' : ''}`, [code]);
  const coupon = result.rows[0];
  const now = Date.now();
  if (!coupon || !coupon.enabled || new Date(coupon.starts_at).getTime() > now || new Date(coupon.ends_at).getTime() <= now) throw new HttpError(400, 'Coupon is invalid or expired');
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) throw new HttpError(409, 'Coupon usage limit has been reached');
  if (subtotal < Number(coupon.minimum_amount) || (coupon.maximum_amount !== null && subtotal > Number(coupon.maximum_amount))) throw new HttpError(400, 'This order does not meet the coupon amount requirements');
  let discount = coupon.type === 'percentage' ? Math.floor(subtotal * Number(coupon.value) / 100) : Number(coupon.value);
  if (coupon.maximum_discount !== null) discount = Math.min(discount, Number(coupon.maximum_discount));
  return Math.min(subtotal, discount);
}

