import { Watch } from '../../types';

export function initialVariantId(watch: Watch, requested?: string) {
  const variants = watch.variants || [];
  return variants.find(item => item.id === requested)?.id || variants.find(item => item.stockQuantity > 0)?.id || variants[0]?.id || '';
}
