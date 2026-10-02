"use client";
import { Watch } from '../types';
import { useSaleClock } from './useSaleClock';
export function useCatalogClock(watches: Watch[]) {
  const current = Date.now();
  const nearest = (key: 'saleStartsAt' | 'saleEndsAt') => watches.map(watch => watch[key]).filter((value): value is string => !!value && new Date(value).getTime() > current).sort()[0] || null;
  return useSaleClock({ saleStartsAt: nearest('saleStartsAt'), saleEndsAt: nearest('saleEndsAt') });
}
