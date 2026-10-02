import type { Database } from '../../domain/ports/Database';
import { CatalogPublication } from '../../domain/integrations/IntegrationPorts';
import { object, uuid } from '../validation';
import { HttpError } from '../errors';
import { timedPrice } from '../../domain/catalog/pricing';

export class MarketplaceMappings {
  constructor(private db: Database) {}
  async list() {
    const rows = await this.db.query(`SELECT m.*,w.name,v.label FROM marketplace_mappings m JOIN watches w ON w.id=m.watch_id LEFT JOIN watch_variants v ON v.id=m.variant_id ORDER BY w.name`);
    return rows.rows.map(row => ({ id: row.id, watchId: row.watch_id, variantId: row.variant_id, externalId: Number(row.external_id), name: row.name, label: row.label }));
  }
  async save(raw: unknown) {
    const body = object(raw), watchId = uuid(body.watchId), variantId = body.variantId ? uuid(body.variantId) : null;
    if (!Number.isSafeInteger(body.externalId) || Number(body.externalId) <= 0) throw new HttpError(400, 'A valid Basalam product ID is required');
    return this.db.transaction(async client => {
      const watch = await client.query('SELECT category FROM watches WHERE id=$1 FOR SHARE', [watchId]);
      if (!watch.rows.length || watch.rows[0].category === 'custom') throw new HttpError(404, 'A sellable watch is required');
      const variants = await client.query('SELECT id FROM watch_variants WHERE watch_id=$1', [watchId]);
      if (variantId ? !variants.rows.some(row => row.id === variantId) : variants.rows.length > 0) throw new HttpError(400, 'Choose the matching product variant');
      const existing = await client.query('SELECT id FROM marketplace_mappings WHERE watch_id=$1 AND variant_id IS NOT DISTINCT FROM $2::uuid', [watchId, variantId]);
      try {
        if (existing.rows.length) await client.query('UPDATE marketplace_mappings SET external_id=$2 WHERE id=$1', [existing.rows[0].id, body.externalId]);
        else await client.query('INSERT INTO marketplace_mappings(watch_id,variant_id,external_id) VALUES($1,$2,$3)', [watchId, variantId, body.externalId]);
      } catch (error: any) { if (error.code === '23505') throw new HttpError(409, 'This Basalam product is already mapped'); throw error; }
    });
  }
  async remove(rawId: unknown) { await this.db.query('DELETE FROM marketplace_mappings WHERE id=$1', [uuid(rawId)]); }
  async publications(): Promise<CatalogPublication[]> {
    const rows = await this.db.query(`SELECT m.*,w.price,w.stock_quantity,w.sale_price,w.sale_starts_at,w.sale_ends_at,v.price AS variant_price,v.stock_quantity AS variant_stock
      FROM marketplace_mappings m JOIN watches w ON w.id=m.watch_id LEFT JOIN watch_variants v ON v.id=m.variant_id WHERE w.category<>'custom'`);
    return rows.rows.map(row => {
      const price = Number(row.variant_price ?? row.price);
      return { watchId: row.watch_id, variantId: row.variant_id, externalId: Number(row.external_id),
        priceToman: timedPrice(Number(row.price), price, row.sale_price === null ? null : Number(row.sale_price), row.sale_starts_at, row.sale_ends_at), stock: Number(row.variant_stock ?? row.stock_quantity) };
    });
  }
}
