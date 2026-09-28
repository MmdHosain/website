import { OtpProvider } from '../../../domain/providers/OtpProvider';
import { query } from '../../../infrastructure/database/postgres';

export class RequestOtpUseCase {
  constructor(private otpProvider: OtpProvider) {}

  async execute(mobile: string): Promise<{ success: boolean; code: string }> {
    // Generate a 5-digit OTP
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Expiry time: 2 minutes from now
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    // Upsert OTP into database
    await query(
      `INSERT INTO otps (mobile, code, expires_at) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (mobile) 
       DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
      [mobile, code, expiresAt]
    );

    // Send via Provider
    await this.otpProvider.sendOtp(mobile, code);

    // Returning code here ONLY for development/mock popup purposes.
    // In production, this code should not be returned to the client.
    return { success: true, code };
  }
}
