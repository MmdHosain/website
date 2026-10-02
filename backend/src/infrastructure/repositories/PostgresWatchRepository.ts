import { WatchRepository } from '../../domain/repositories/WatchRepository';
import { Watch, WatchVariant } from '../../domain/entities/Watch';
import { Database, database } from '../database/postgres';
import { watchData } from '../../application/catalog/watchValidation';
import { enqueueRestockAlerts } from '../../application/catalog/restock';
import { HttpError } from '../../application/errors';

type Executor = Pick<Database, 'query'> & Partial<Pick<Database, 'transaction'>>;
export class PostgresWatchRepository implements WatchRepository {
  constructor(private db: Executor = database) {}
  private async write<T>(work: (client: Pick<Database, 'query'>) => Promise<T>): Promise<T> {
    try { return this.db.transaction ? await this.db.transaction(work) : await work(this.db); }
    catch (error: any) { if (error.code === '23505') throw new HttpError(409, 'This SKU is already in use'); throw error; }
  }
  async findAll(): Promise<Watch[]> {
    const [watches, variants] = await Promise.all([
      this.db.query('SELECT * FROM watches ORDER BY name ASC'),
      this.db.query('SELECT * FROM watch_variants ORDER BY label ASC,id ASC'),
    ]);
    return watches.rows.map(row => this.map(row, variants.rows.filter(item => item.watch_id === row.id)));
  }
  async findById(id: string): Promise<Watch | null> {
    const result = await this.db.query('SELECT * FROM watches WHERE id=$1', [id]);
    if (!result.rows.length) return null;
    const variants = await this.db.query('SELECT * FROM watch_variants WHERE watch_id=$1 ORDER BY label ASC,id ASC', [id]);
    return this.map(result.rows[0], variants.rows);
  }
  async create(input: Omit<Watch, 'id'>): Promise<Watch> {
    const data = watchData(input);
    return this.write(async client => {
      const result = await client.query(`INSERT INTO watches(name,description,price,image_url,category,stock_quantity,sale_price,sale_starts_at,sale_ends_at,sku,features,meta_title,meta_description)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`, this.values(data));
      const id = result.rows[0].id;
      await this.saveVariants(client, id, data.variants);
      return (await new PostgresWatchRepository(client).findById(id))!;
    });
  }
  async update(id: string, input: Partial<Omit<Watch, 'id'>>): Promise<Watch | null> {
    return this.write(async client => {
      const locked = await client.query('SELECT id FROM watches WHERE id=$1 FOR UPDATE', [id]);
      if (!locked.rows.length) return null;
      await client.query('SELECT id FROM watch_variants WHERE watch_id=$1 ORDER BY id FOR UPDATE', [id]);
      const repository = new PostgresWatchRepository(client);
      const before = (await repository.findById(id))!;
      const data = watchData({ ...before, ...input });
      await client.query(`UPDATE watches SET name=$1,description=$2,price=$3,image_url=$4,category=$5,stock_quantity=$6,
        sale_price=$7,sale_starts_at=$8,sale_ends_at=$9,sku=$10,features=$11,meta_title=$12,meta_description=$13 WHERE id=$14`, [...this.values(data), id]);
      await this.saveVariants(client, id, data.variants);
      const after = (await repository.findById(id))!;
      await enqueueRestockAlerts(client, before, after);
      return after;
    });
  }
  async delete(id: string): Promise<boolean> {
    return this.write(async client => {
      await client.query('SELECT id FROM watches WHERE id=$1 FOR UPDATE', [id]);
      const active = await client.query("SELECT id FROM orders WHERE status=ANY($1::text[]) AND items @> $2::jsonb LIMIT 1", [['pending_payment', 'paid', 'confirmed'], JSON.stringify([{ watchId: id }])]);
      if (active.rows.length) throw new HttpError(409, 'This product is part of an active order and cannot be deleted');
      return (await client.query('DELETE FROM watches WHERE id=$1 RETURNING id', [id])).rows.length > 0;
    });
  }
  private values(data: Record<string, any>) {
    return [data.name, data.description, data.price, data.imageUrl, data.category,
      data.stockQuantity, data.salePrice, data.saleStartsAt, data.saleEndsAt, data.sku, data.features, data.metaTitle, data.metaDescription];
  }
  private async saveVariants(client: Pick<Database, 'query'>, watchId: string, variants: WatchVariant[]) {
    const removed = await client.query('SELECT id FROM watch_variants WHERE watch_id=$1 AND NOT(id=ANY($2::uuid[]))', [watchId, variants.map(item => item.id)]);
    for (const row of removed.rows) {
      const active = await client.query("SELECT id FROM orders WHERE status=ANY($1::text[]) AND items @> $2::jsonb LIMIT 1", [['pending_payment', 'paid', 'confirmed'], JSON.stringify([{ watchId, variantId: row.id }])]);
      if (active.rows.length) throw new HttpError(409, 'A removed variant is part of an active order');
    }
    await client.query('DELETE FROM watch_variants WHERE watch_id=$1 AND NOT(id=ANY($2::uuid[]))', [watchId, variants.map(item => item.id)]);
    for (const variant of variants) {
      const result = await client.query(`INSERT INTO watch_variants(id,watch_id,sku,label,color,price,stock_quantity) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(id) DO UPDATE SET sku=EXCLUDED.sku,label=EXCLUDED.label,color=EXCLUDED.color,price=EXCLUDED.price,stock_quantity=EXCLUDED.stock_quantity
        WHERE watch_variants.watch_id=EXCLUDED.watch_id RETURNING id`,
      [variant.id, watchId, variant.sku, variant.label, variant.color || null, variant.price, variant.stockQuantity]);
      if (!result.rows.length) throw new HttpError(400, 'A variant belongs to another product');
    }
  }
  private map(row: any, variants: any[]): Watch {
    return new Watch(row.id, row.name, row.description, Number(row.price), row.image_url, row.category || 'original',
      Number(row.stock_quantity ?? 20), variants.map(item => ({ id: item.id, sku: item.sku, label: item.label,
        ...(item.color ? { color: item.color } : {}), price: Number(item.price), stockQuantity: Number(item.stock_quantity) })),
      row.sale_price === null || row.sale_price === undefined ? null : Number(row.sale_price),
      row.sale_starts_at ? new Date(row.sale_starts_at).toISOString() : null, row.sale_ends_at ? new Date(row.sale_ends_at).toISOString() : null,
      row.sku || null, row.features || '', row.meta_title || '', row.meta_description || '');
  }
}
