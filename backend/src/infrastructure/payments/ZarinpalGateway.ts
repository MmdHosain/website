import type { PaymentGateway } from '../../domain/ports/PaymentGateway';
export type { PaymentGateway } from '../../domain/ports/PaymentGateway';
export class PaymentError extends Error {
  constructor(message: string, public status: number, public providerCode?: number) { super(message); }
}
/** Application amounts are whole toman. Zarinpal requests and verification use rial. */
export class ZarinpalGateway implements PaymentGateway {
  private baseUrl: string;
  constructor(private merchantId: string, private sandbox: boolean, private transport: typeof fetch = fetch) {
    if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(merchantId)) {
      throw new PaymentError('Payment gateway is not configured. Please contact the store.', 503);
    }
    this.baseUrl = `https://${sandbox ? 'sandbox' : 'payment'}.zarinpal.com`;
  }
  private rial(amount: number) {
    if (!Number.isSafeInteger(amount) || amount < 1000 || amount > 100000000 || !Number.isSafeInteger(amount * 10)) {
      throw new PaymentError('Payment amount is invalid.', 400);
    }
    return amount * 10;
  }
  private async send(method: 'request' | 'verify' | 'inquiry', body: Record<string, unknown>) {
    try {
      const response = await this.transport(`${this.baseUrl}/pg/v4/payment/${method}.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ merchant_id: this.merchantId, ...body }), signal: AbortSignal.timeout(15000),
      });
      const result = await response.json() as { data?: { code: number; authority?: string; ref_id?: number | string; status?: string }; errors?: { code?: number; authority?: string[] } | [] };
      const providerCode = result.errors && !Array.isArray(result.errors) ? result.errors.code : undefined;
      if (typeof providerCode === 'number') throw new PaymentError('Payment gateway rejected the request. Please try again or contact the store.', 502, providerCode);
      if (result.errors && !Array.isArray(result.errors) && result.errors.authority?.includes('-54')) throw new PaymentError('Payment reference is invalid.', 502, -54);
      if (!response.ok || !result.data) throw new Error('Gateway rejected request');
      return result.data;
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      throw new PaymentError('Unable to contact the payment gateway. Please try again.', 502);
    }
  }
  async requestPayment(input: { orderId: string; amount: number; description: string; callbackUrl: string; mobile?: string; email?: string }) {
    const callback = new URL(input.callbackUrl);
    if (!['http:', 'https:'].includes(callback.protocol) || (!this.sandbox && callback.protocol !== 'https:')) {
      throw new PaymentError('Payment callback URL is not configured correctly.', 503);
    }
    const data = await this.send('request', {
      amount: this.rial(input.amount), currency: 'IRR', description: input.description,
      callback_url: callback.toString(), metadata: { order_id: input.orderId, mobile: input.mobile, email: input.email },
    });
    if (data.code !== 100 || typeof data.authority !== 'string' || !/^[AS][a-zA-Z0-9]{35}$/.test(data.authority)) {
      throw new PaymentError('Payment gateway could not start this payment. Please try again.', 502);
    }
    return { authority: data.authority, paymentUrl: `${this.baseUrl}/pg/StartPay/${data.authority}` };
  }
  async verifyPayment(input: { authority: string; amount: number }) {
    if (!/^[AS][a-zA-Z0-9]{35}$/.test(input.authority)) throw new PaymentError('Invalid payment reference.', 400);
    const data = await this.send('verify', { amount: this.rial(input.amount), authority: input.authority });
    if (![100, 101].includes(data.code) || !data.ref_id || !/^\d+$/.test(String(data.ref_id))) {
      throw new PaymentError('Payment has not been verified.', 402, data.code);
    }
    return { refId: String(data.ref_id) };
  }
  async inquirePayment(input: { authority: string }): Promise<{ status: 'VERIFIED' | 'PAID' | 'IN_BANK' | 'FAILED' | 'REVERSED' }> {
    if (!/^[AS][a-zA-Z0-9]{35}$/.test(input.authority)) throw new PaymentError('Invalid payment reference.', 400);
    const data = await this.send('inquiry', { authority: input.authority });
    if (data.code !== 100 || !['VERIFIED', 'PAID', 'IN_BANK', 'FAILED', 'REVERSED'].includes(data.status || '')) {
      throw new PaymentError('Payment status could not be checked. Please try again.', 502, data.code);
    }
    return { status: data.status as 'VERIFIED' | 'PAID' | 'IN_BANK' | 'FAILED' | 'REVERSED' };
  }
}
export function createPaymentGateway(): PaymentGateway {
  const sandbox = process.env.ZARINPAL_SANDBOX === undefined
    ? process.env.NODE_ENV !== 'production' : process.env.ZARINPAL_SANDBOX === 'true';
  const merchantId = process.env.ZARINPAL_MERCHANT_ID || (sandbox ? '00000000-0000-0000-0000-000000000000' : '');
  if (!sandbox && merchantId === '00000000-0000-0000-0000-000000000000') throw new PaymentError('A live payment merchant is required.', 503);
  return new ZarinpalGateway(merchantId, sandbox);
}
