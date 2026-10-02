import { apiRequest, ApiError, getApiBaseUrl } from './api';
import { authService } from './auth.service';
export interface ImportPreview { id:string; expiresAt:string; canConfirm:boolean; createCount:number; updateCount:number;
  rows:{ row:number; sku:string; name:string; price:number; stockQuantity:number; action:'create'|'update'; metaTitle:string; metaDescription:string }[];
  errors:{ row:number; field:string; message:string }[]; }
async function rawRequest(path:string,options:RequestInit = {}) {
  const token = authService.getToken();
  const response = await fetch(`${getApiBaseUrl()}${path}`,{ ...options,headers:{ ...options.headers,Authorization:`Bearer ${token || ''}` },signal:AbortSignal.timeout(120000) });
  if (!response.ok) {
    if (response.status===401 && authService.getToken()===token) { localStorage.removeItem('ariwatch_token');localStorage.removeItem('ariwatch_user');window.dispatchEvent(new Event('ariwatch:auth')); }
    const error = await response.json().catch(() => ({})); throw new ApiError(error.error || 'Import request failed',response.status);
  }
  return response;
}
export const bulkService = {
  async template() {
    const response = await rawRequest('/api/admin/catalog/import/template'), url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a'); link.href=url; link.download='ariwatch-catalog-template.xlsx'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url),1000);
  },
  async preview(workbook:File,images:File|null):Promise<ImportPreview> {
    const body = new FormData(); body.set('workbook',workbook); if (images) body.set('images',images);
    return (await rawRequest('/api/admin/catalog/import/preview',{ method:'POST',body })).json();
  },
  confirm(id:string) { return apiRequest<{ imported:number; created:number; updated:number }>(`/api/admin/catalog/import/${id}/confirm`,{ method:'POST',authenticated:true }); },
};
