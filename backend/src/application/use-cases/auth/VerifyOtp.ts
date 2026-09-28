import { User } from '../../../domain/entities/User';
import { query } from '../../../infrastructure/database/postgres';

export class VerifyOtpUseCase {
  async execute(mobile: string, code: string): Promise<{ user: User; token: string }> {
    // 1. Verify OTP
    const otpResult = await query('SELECT * FROM otps WHERE mobile = $1', [mobile]);
    
    if (otpResult.rows.length === 0) {
      throw new Error('OTP not found');
    }

    const otpRecord = otpResult.rows[0];

    if (otpRecord.code !== code) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      throw new Error('OTP expired');
    }

    // 2. Delete used OTP
    await query('DELETE FROM otps WHERE mobile = $1', [mobile]);

    // 3. Find or Create User
    let userResult = await query('SELECT * FROM users WHERE mobile = $1', [mobile]);
    let userRecord;

    if (userResult.rows.length === 0) {
      const insertResult = await query(
        'INSERT INTO users (mobile, role) VALUES ($1, $2) RETURNING *',
        [mobile, 'user']
      );
      userRecord = insertResult.rows[0];
    } else {
      userRecord = userResult.rows[0];
    }

    const user = new User(userRecord.id, userRecord.mobile, userRecord.role);

    // 4. Generate Token (Using a simple Base64 mock token for MVP without external JWT libraries)
    const tokenPayload = JSON.stringify({ id: user.id, mobile: user.mobile, role: user.role });
    const token = Buffer.from(tokenPayload).toString('base64');

    return { user, token };
  }
}
