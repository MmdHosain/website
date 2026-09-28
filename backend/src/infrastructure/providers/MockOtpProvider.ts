import { OtpProvider } from '../../domain/providers/OtpProvider';

export class MockOtpProvider implements OtpProvider {
  async sendOtp(mobile: string, code: string): Promise<boolean> {
    // In a real scenario, this would call Kavenegar, Twilio, etc.
    console.log(`[MOCK SMS PROVIDER] Sending OTP ${code} to mobile ${mobile}`);
    return true;
  }
}
