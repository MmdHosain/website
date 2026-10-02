import { apiRequest, ApiError } from './api';
export interface AuthUser { id: string; mobile: string; role: 'user' | 'admin' | 'staff_orders' | 'staff_catalog' | 'staff_blog'; }
const notify = () => window.dispatchEvent(new Event('ariwatch:auth'));
export const authService = {
  requestOtp(mobile: string) {
    return apiRequest<{ success: boolean; devOtp?: string; mobile?: string }>('/api/auth/request-otp', { method: 'POST', body: { mobile } });
  },
  async verifyOtp(mobile: string, code: string) {
    const data = await apiRequest<{ user: AuthUser; token: string }>('/api/auth/verify-otp', { method: 'POST', body: { mobile, code } });
    localStorage.setItem('ariwatch_token', data.token);
    localStorage.setItem('ariwatch_user', JSON.stringify(data.user));
    notify();
    return data;
  },
  getToken() { return typeof window === 'undefined' ? null : localStorage.getItem('ariwatch_token'); },
  getUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('ariwatch_user') || 'null'); } catch { return null; }
  },
  async me(): Promise<AuthUser> {
    const token = authService.getToken();
    const data = await apiRequest<{ user: AuthUser }>('/api/auth/me', { authenticated: true });
    if (authService.getToken() !== token) throw new ApiError('Your session changed. Please try again.', 409);
    localStorage.setItem('ariwatch_user', JSON.stringify(data.user));
    return data.user;
  },
  async logout() {
    const token = authService.getToken();
    localStorage.removeItem('ariwatch_token');
    localStorage.removeItem('ariwatch_user');
    notify();
    if (token) await apiRequest('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  },
  isAuthenticated() { return !!authService.getToken(); },
};
