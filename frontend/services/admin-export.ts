import { ApiError, getApiBaseUrl } from './api';
import { authService } from './auth.service';
export async function downloadOrders() {
  const response = await fetch(`${getApiBaseUrl()}/api/admin/orders/export`, { headers: { Authorization: `Bearer ${authService.getToken() || ''}` }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new ApiError(data.error || 'Could not export orders', response.status); }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = 'orders.xlsx'; link.click(); URL.revokeObjectURL(url);
}
