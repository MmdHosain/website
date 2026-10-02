import type { Database } from '../../domain/ports/Database';
import { PriceObservation } from '../../domain/integrations/IntegrationPorts';
import { object, text, uuid } from '../validation';
import { HttpError } from '../errors';

export class PriceReports {
  constructor(private db: Database) {}
  async list() {
    const result = await this.db.query(`SELECT p.*,w.name,w.price FROM competitive_prices p JOIN watches w ON w.id=p.watch_id ORDER BY p.observed_at DESC LIMIT 1000`);
    return result.rows.map(row => ({ id: row.id, watchId: row.watch_id, name: row.name, storePrice: Number(row.price),
      priceToman: Number(row.price_toman), difference: Number(row.price) - Number(row.price_toman), source: row.source,
      url: row.url, observedAt: new Date(row.observed_at).toISOString() }));
  }
  async save(observations: PriceObservation[]): Promise<void> {
    await this.db.transaction(async client => {
      for (const row of observations) await client.query(`INSERT INTO competitive_prices(watch_id,source,url,price_toman,observed_at)
        VALUES($1,$2,$3,$4,$5) ON CONFLICT(watch_id,source,url) DO UPDATE SET price_toman=EXCLUDED.price_toman,observed_at=EXCLUDED.observed_at
        WHERE competitive_prices.observed_at<=EXCLUDED.observed_at`, [row.watchId, row.source, row.url, row.priceToman, row.observedAt]);
    });
  }
  async addManual(raw: unknown) {
    const body = object(raw), watchId = uuid(body.watchId), source = text(body.source, 'Source', 120);
    const url = text(body.url, 'Product URL', 2000);
    try { const parsed = new URL(url); if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error(); }
    catch { throw new HttpError(400, 'Product URL must use HTTPS'); }
    if (!Number.isSafeInteger(body.priceToman) || Number(body.priceToman) <= 0 || Number(body.priceToman) > 10_000_000_000) throw new HttpError(400, 'Enter a whole positive toman amount');
    if (!(await this.db.query('SELECT id FROM watches WHERE id=$1', [watchId])).rows.length) throw new HttpError(404, 'Watch not found');
    await this.save([{ watchId, source, url, priceToman: Number(body.priceToman), observedAt: new Date().toISOString() }]);
  }
}
