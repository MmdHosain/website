import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'crypto';
import type { Database } from '../../domain/ports/Database';
import { OtpProvider } from '../../domain/providers/OtpProvider';
import { User } from '../../domain/entities/User';
import { HttpError } from '../errors';
import { digits, mobileNumber } from '../validation';
import { configuredAdminMobiles } from '../auth/adminMobiles';

export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
const otpHash = (code: string, salt: string) => scryptSync(code, salt, 32).toString('hex');

export class AuthService {
  constructor(private provider: OtpProvider, private db: Database) {}

  async requestOtp(value: unknown): Promise<{ success: true; devOtp?: string }> {
    const mobile = mobileNumber(value);
    const code = randomInt(100000, 1000000).toString();
    const salt = randomBytes(16).toString('hex');
    await this.db.transaction(async client => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`otp:${mobile}`]);
      const current = await client.query('SELECT requested_at FROM otps WHERE mobile=$1', [mobile]);
      if (current.rows.length && Date.now() - new Date(current.rows[0].requested_at).getTime() < 60_000) throw new HttpError(429, 'Please wait 60 seconds before requesting another code');
      if (!await this.provider.sendOtp(mobile, code)) throw new HttpError(503, 'SMS delivery is unavailable');
      await client.query(`INSERT INTO otps(mobile,code,code_hash,salt,expires_at,attempts,requested_at)
        VALUES($1,'',$2,$3,$4,0,NOW()) ON CONFLICT(mobile) DO UPDATE SET code='',code_hash=$2,salt=$3,expires_at=$4,attempts=0,requested_at=NOW()`,
      [mobile, otpHash(code, salt), salt, new Date(Date.now() + 5 * 60_000)]);
    });
    return process.env.NODE_ENV === 'production' ? { success: true } : { success: true, devOtp: code };
  }

  async verifyOtp(value: unknown, rawCode: unknown): Promise<{ success: true; user: User; token: string }> {
    const mobile = mobileNumber(value);
    if (typeof rawCode !== 'string' || !/^\d{6}$/.test(digits(rawCode.trim()))) throw new HttpError(400, 'Enter the six-digit verification code');
    const code = digits(rawCode.trim());
    const outcome = await this.db.transaction(async client => {
      const result = await client.query('SELECT * FROM otps WHERE mobile=$1 FOR UPDATE', [mobile]);
      const otp = result.rows[0];
      if (!otp?.code_hash || !otp.salt || new Date(otp.expires_at).getTime() <= Date.now()) return { error: new HttpError(400, 'Code is expired or unavailable; request a new code') };
      if (otp.attempts >= 5) return { error: new HttpError(429, 'Too many attempts; request a new code') };
      const expected = Buffer.from(otp.code_hash, 'hex');
      const submitted = Buffer.from(otpHash(code, otp.salt), 'hex');
      if (expected.length !== submitted.length || !timingSafeEqual(expected, submitted)) {
        await client.query('UPDATE otps SET attempts=attempts+1 WHERE mobile=$1', [mobile]);
        return { error: new HttpError(400, 'Invalid verification code') };
      }
      await client.query('DELETE FROM otps WHERE mobile=$1', [mobile]);
      const admins = configuredAdminMobiles();
      const users = await client.query(`INSERT INTO users(mobile,role) VALUES($1,$2) ON CONFLICT(mobile) DO UPDATE SET role=CASE WHEN $2='admin' THEN 'admin' ELSE users.role END RETURNING *`, [mobile, admins.includes(mobile) ? 'admin' : 'user']);
      const row = users.rows[0];
      const user = new User(row.id, row.mobile, row.role);
      const token = randomBytes(32).toString('base64url');
      await client.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)', [tokenHash(token), user.id, new Date(Date.now() + 7 * 24 * 60 * 60_000)]);
      return { user, token };
    });
    if (outcome.error) throw outcome.error;
    return { success: true, user: outcome.user!, token: outcome.token! };
  }

  async authenticate(token: string): Promise<User> {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new HttpError(401, 'Sign in to continue');
    const result = await this.db.query(`SELECT users.id,users.mobile,users.role FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=$1 AND expires_at>NOW()`, [tokenHash(token)]);
    const user = result.rows[0];
    if (!user) throw new HttpError(401, 'Session expired; sign in again');
    return new User(user.id, user.mobile, user.role);
  }
  async logout(token: string): Promise<void> { await this.db.query('DELETE FROM sessions WHERE token_hash=$1', [tokenHash(token)]); }
}

