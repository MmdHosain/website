import { HttpError } from './errors';

export function digits(value: string): string {
  return value.replace(/[۰-۹]/g, c => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, c => String(c.charCodeAt(0) - 1632));
}
export function mobileNumber(value: unknown): string {
  if (typeof value !== 'string') throw new HttpError(400, 'A valid Iranian mobile number is required');
  let mobile = digits(value).replace(/[\s()-]/g, '');
  if (mobile.startsWith('+98')) mobile = `0${mobile.slice(3)}`;
  else if (mobile.startsWith('0098')) mobile = `0${mobile.slice(4)}`;
  else if (mobile.startsWith('98') && mobile.length === 12) mobile = `0${mobile.slice(2)}`;
  if (!/^09\d{9}$/.test(mobile)) throw new HttpError(400, 'A valid Iranian mobile number is required');
  return mobile;
}
export function uuid(value: unknown, label = 'ID', strict = false): string {
  const pattern = strict ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof value !== 'string' || !pattern.test(value)) throw new HttpError(400, `${label} must be a valid UUID`);
  return value.toLowerCase();
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'A JSON object is required');
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, max: number, min = 1): string {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new HttpError(400, `${label} must contain ${min}-${max} characters`);
  return value.trim();
}
export function email(value: unknown): string {
  const result = text(value, 'Email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new HttpError(400, 'A valid email is required');
  return result;
}
export function language(value: unknown): 'en' | 'fa' {
  if (value === undefined) return 'en';
  if (value !== 'en' && value !== 'fa') throw new HttpError(400, 'Language must be en or fa');
  return value;
}
export { watchData } from './catalog/watchValidation';
export { orderInput } from './orders/input';
export type { Customer, OrderInput } from './orders/input';

