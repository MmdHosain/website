import { OtpProvider } from '../../domain/providers/OtpProvider';

export class MockOtpProvider implements OtpProvider {
  async sendOtp(mobile: string, code: string): Promise<boolean> {
    if (process.env.NODE_ENV === 'production') throw new Error('Mock SMS is disabled in production');
    return true;
  }
}
