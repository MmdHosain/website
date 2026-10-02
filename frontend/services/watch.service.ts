import { Watch } from '../types';
import { apiRequest, ApiError } from './api';
export const watchService = {
  getAll(): Promise<Watch[]> { return apiRequest('/api/watches'); },
  async getById(id: string): Promise<Watch | null> {
    try { return await apiRequest(`/api/watches/${encodeURIComponent(id)}`); }
    catch (error) { if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null; throw error; }
  },
  create(data: Omit<Watch, 'id'>): Promise<Watch> {
    return apiRequest('/api/watches', { method: 'POST', body: data, authenticated: true });
  },
  update(id: string, data: Partial<Watch>): Promise<Watch> {
    return apiRequest(`/api/watches/${encodeURIComponent(id)}`, { method: 'PUT', body: data, authenticated: true });
  },
  async delete(id: string): Promise<boolean> {
    await apiRequest(`/api/watches/${encodeURIComponent(id)}`, { method: 'DELETE', authenticated: true });
    return true;
  },
};
