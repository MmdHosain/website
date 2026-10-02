import { OtpProvider } from '../../domain/providers/OtpProvider';
import { HttpError } from '../../application/errors';
import { MockOtpProvider } from './MockOtpProvider';

export class HttpOtpProvider implements OtpProvider {
  async sendOtp(mobile: string, code: string): Promise<boolean> {
    const endpoint = process.env.OTP_PROVIDER_URL;
    const token = process.env.OTP_PROVIDER_TOKEN;
    if (!endpoint || !token) throw new HttpError(503, 'SMS delivery is not configured');
    if (!endpoint.startsWith('https://')) throw new HttpError(503, 'SMS provider must use HTTPS');
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mobile, code }), signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new Error('SMS rejected');
      return true;
    } catch { throw new HttpError(503, 'SMS delivery is temporarily unavailable'); }
  }
}
export function createOtpProvider(): OtpProvider {
  return process.env.NODE_ENV === 'production' || process.env.OTP_PROVIDER_URL ? new HttpOtpProvider() : new MockOtpProvider();
}
