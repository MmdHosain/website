import { HERO_STYLES, StoreSettings } from '../../domain/entities/StoreSettings';
import { HttpError } from '../errors';
import { object } from '../validation';
import { money } from '../commerce/discounts';

export function storeSettingsInput(value: unknown): Partial<StoreSettings> {
  const body = object(value);
  const keys = Object.keys(body);
  if (!keys.length || keys.some(key => !['shippingCost', 'heroStyle'].includes(key))) {
    throw new HttpError(400, 'Provide shippingCost or heroStyle; other settings are not supported');
  }
  const input: Partial<StoreSettings> = {};
  if (Object.hasOwn(body, 'shippingCost')) input.shippingCost = money(body.shippingCost, 'Shipping cost')!;
  if (Object.hasOwn(body, 'heroStyle')) {
    if (!HERO_STYLES.includes(body.heroStyle as typeof HERO_STYLES[number])) {
      throw new HttpError(400, 'Hero style must be watch-photos or classic-clock');
    }
    input.heroStyle = body.heroStyle as typeof HERO_STYLES[number];
  }
  return input;
}
