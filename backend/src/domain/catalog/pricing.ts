export function timedPrice(basePrice: number, unitPrice: number, salePrice: number | null, startsAt: string | Date | null, endsAt: string | Date | null, now = Date.now()): number {
  if (salePrice === null || salePrice <= 0 || salePrice >= basePrice || !startsAt || !endsAt ||
      new Date(startsAt).getTime() > now || new Date(endsAt).getTime() <= now) return unitPrice;
  return Math.max(1, Math.round(unitPrice * salePrice / basePrice));
}
