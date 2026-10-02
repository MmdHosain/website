import { HttpError } from '../../application/errors';

export async function jsonHttp(url: string, init: RequestInit = {}, transport: typeof fetch = fetch): Promise<any> {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new HttpError(503, 'Integration requires an HTTPS endpoint');
  let response: Response;
  try { response = await transport(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(15_000) }); }
  catch { throw new HttpError(502, 'Integration connection failed'); }
  if (!response.ok) throw new HttpError(502, `Integration returned HTTP ${response.status}`);
  const body = await response.text();
  if (body.length > 2_000_000) throw new HttpError(502, 'Integration response is too large');
  try { return JSON.parse(body); } catch { throw new HttpError(502, 'Integration returned invalid JSON'); }
}

export function secureUrl(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2000) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
