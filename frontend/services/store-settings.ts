import { apiRequest } from './api';

export type HeroStyle = 'watch-photos' | 'classic-clock';
export interface StorefrontSettings { heroStyle: HeroStyle; }

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  try {
    const settings = await apiRequest<StorefrontSettings>('/api/storefront/settings');
    if (settings.heroStyle === 'classic-clock') return { heroStyle: 'classic-clock' };
  } catch { /* Keep the default hero available during a settings outage. */ }
  return { heroStyle: 'watch-photos' };
}
