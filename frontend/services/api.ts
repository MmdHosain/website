export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError'; }
}
export const getApiBaseUrl = () => typeof window === 'undefined'
  ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
interface ApiOptions { method?: string; body?: unknown; authenticated?: boolean; headers?: Record<string, string>; }
export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.authenticated && typeof window !== 'undefined') {
    const token = localStorage.getItem('ariwatch_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const sentToken = new Headers(headers).get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options.method || 'GET', headers, cache: 'no-store',
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(30000),
    });
  } catch { throw new ApiError('Unable to reach the store. Please try again.', 0); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && sentToken && typeof window !== 'undefined' && localStorage.getItem('ariwatch_token') === sentToken) {
      localStorage.removeItem('ariwatch_token');
      localStorage.removeItem('ariwatch_user');
      window.dispatchEvent(new Event('ariwatch:auth'));
    }
    throw new ApiError(data.error || 'The request could not be completed.', response.status);
  }
  return data as T;
}
