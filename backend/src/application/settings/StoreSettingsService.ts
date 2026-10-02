import type { QueryExecutor } from '../../domain/ports/Database';
import type { StoreSettings } from '../../domain/entities/StoreSettings';
import { HttpError } from '../errors';
import { storeSettingsInput } from './input';

export class StoreSettingsService {
  constructor(private db: QueryExecutor) {}
  private map(row: any): StoreSettings {
    if (!row) throw new HttpError(503, 'Store settings are unavailable');
    return { shippingCost: Number(row.shipping_cost), heroStyle: row.hero_style };
  }
  async get(): Promise<StoreSettings> {
    return this.map((await this.db.query('SELECT shipping_cost,hero_style FROM store_settings WHERE id=TRUE')).rows[0]);
  }
  async update(body: unknown): Promise<StoreSettings> {
    const input = storeSettingsInput(body);
    // Change only provided columns in one statement so concurrent partial saves preserve each other.
    const result = await this.db.query(`UPDATE store_settings SET shipping_cost=COALESCE($1::numeric,shipping_cost),
      hero_style=COALESCE($2::varchar,hero_style) WHERE id=TRUE RETURNING shipping_cost,hero_style`,
    [input.shippingCost ?? null, input.heroStyle ?? null]);
    return this.map(result.rows[0]);
  }
}
