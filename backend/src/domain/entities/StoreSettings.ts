export const HERO_STYLES = ['watch-photos', 'classic-clock'] as const;
export type HeroStyle = typeof HERO_STYLES[number];
export interface StoreSettings { shippingCost: number; heroStyle: HeroStyle; }
