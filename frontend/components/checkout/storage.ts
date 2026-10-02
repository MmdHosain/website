import { CheckoutRequest, OrderCustomer } from '../../services/order.service';

export const DRAFT_KEY = 'ariwatch_checkout_draft';
const ATTEMPTS_KEY = 'ariwatch_checkout_attempts';
interface Attempt { key: string; fingerprint: string; orderId?: string; }
export const emptyCustomer: OrderCustomer = { name: '', email: '', address: '', city: '', postalCode: '', notes: '' };

export function readCustomer(): OrderCustomer {
  try {
    const value = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}');
    return Object.fromEntries(Object.entries(emptyCustomer).map(([key]) => [key, typeof value?.[key] === 'string' ? value[key].slice(0, 1000) : ''])) as unknown as OrderCustomer;
  } catch { return { ...emptyCustomer }; }
}

function readAttempts(): Attempt[] {
  try {
    const attempts: unknown = JSON.parse(sessionStorage.getItem(ATTEMPTS_KEY) || '[]');
    return Array.isArray(attempts) ? attempts.filter(attempt => typeof attempt?.key === 'string' && typeof attempt?.fingerprint === 'string') : [];
  } catch { return []; }
}

function writeAttempts(attempts: Attempt[]) {
  try { sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(-20))); } catch { /* In-memory retry keys remain available to the form. */ }
}

export function requestFingerprint(request: CheckoutRequest) {
  return JSON.stringify({ ...request, items: [...request.items].sort((a, b) => `${a.watchId}:${a.variantId || ''}`.localeCompare(`${b.watchId}:${b.variantId || ''}`)) });
}

export function getCheckoutAttempt(request: CheckoutRequest): Attempt {
  const fingerprint = requestFingerprint(request);
  const attempts = readAttempts();
  const existing = attempts.find(attempt => attempt.fingerprint === fingerprint);
  if (existing) return existing;
  const key = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, digit =>
    (Number(digit) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(digit) / 4)))).toString(16));
  const attempt: Attempt = { key, fingerprint };
  writeAttempts([...attempts, attempt]);
  return attempt;
}

export function saveAttemptOrder(key: string, orderId: string) {
  writeAttempts(readAttempts().map(attempt => attempt.key === key ? { ...attempt, orderId } : attempt));
}

export function hasCheckoutAttempt(orderId: string) { return readAttempts().some(attempt => attempt.orderId === orderId); }
export function abandonCheckoutAttempt(keyOrOrderId: string) {
  writeAttempts(readAttempts().filter(attempt => attempt.key !== keyOrOrderId && attempt.orderId !== keyOrOrderId));
}
export function completeCheckoutAttempt(orderId: string) {
  abandonCheckoutAttempt(orderId);
  try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* No saved draft is required. */ }
}
