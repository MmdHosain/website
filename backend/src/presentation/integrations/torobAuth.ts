import { createPublicKey, verify } from 'crypto';
import { HttpError } from '../../application/errors';

const publicKey = '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0=\n-----END PUBLIC KEY-----';
export function validateTorobToken(token: string, version: string, audience: string, key = publicKey, now = Date.now() / 1000): void {
  try {
    const parts = token.split('.');
    if (token.length > 4096 || parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part)) || version !== '1' || !audience) throw new Error();
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    if (header.alg !== 'EdDSA' || header.v !== 1 || !Number.isFinite(claims.exp) || !Number.isFinite(claims.nbf) || claims.exp <= now || claims.nbf > now || claims.aud !== audience) throw new Error();
    if (!verify(null, Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey(key), Buffer.from(parts[2], 'base64url'))) throw new Error();
  } catch { throw new HttpError(401, 'Invalid Torob token'); }
}
