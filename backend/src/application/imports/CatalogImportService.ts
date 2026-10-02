import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { resolve, join } from 'path';
import type { Database } from '../../domain/ports/Database';
import type { CatalogRepositoryFactory } from '../../domain/ports/CatalogRepositoryFactory';
import { Watch } from '../../domain/entities/Watch';
import { HttpError } from '../errors';
import { CatalogRow, readCatalogRows } from './catalogRows';
import { imageExtension, safeArchive } from './safeArchive';

export class CatalogImportService {
  constructor(private db: Database, private catalog: CatalogRepositoryFactory, private mediaDirectory: string, private mediaBaseUrl = '/media/catalog') {}
  async preview(userId: string, workbook: Buffer, imagesZip?: Buffer) {
    const entries = imagesZip ? safeArchive(imagesZip,'images') : {};
    const images = Object.fromEntries(Object.entries(entries).map(([name,bytes]) => [name,{ ext:imageExtension(name,bytes),data:bytes.toString('base64') }]));
    const parsed = await readCatalogRows(workbook,Object.keys(images));
    const existing = await this.db.query('SELECT sku FROM watches WHERE sku=ANY($1::text[])', [parsed.rows.map(row => row.sku)]);
    const skus = new Set(existing.rows.map(row => row.sku));
    const id = randomUUID(), expiresAt = new Date(Date.now() + 20 * 60000).toISOString();
    await this.db.query('DELETE FROM catalog_imports WHERE expires_at<NOW()');
    await this.db.query('INSERT INTO catalog_imports(id,user_id,rows,images,errors,expires_at) VALUES($1,$2,$3,$4,$5,$6)',
      [id,userId,JSON.stringify(parsed.rows),JSON.stringify(images),JSON.stringify(parsed.errors),expiresAt]);
    return { id,expiresAt,rows:parsed.rows.map(row => ({ ...row,action:skus.has(row.sku) ? 'update' : 'create' })),errors:parsed.errors,
      canConfirm:!parsed.errors.length,createCount:parsed.rows.filter(row => !skus.has(row.sku)).length,updateCount:parsed.rows.filter(row => skus.has(row.sku)).length };
  }
  async confirm(userId: string, id: string) {
    const written: string[] = [];
    try {
      return await this.db.transaction(async client => {
        await client.query("SELECT pg_advisory_xact_lock(hashtext('catalog:bulk'))");
        const selected = await client.query('SELECT * FROM catalog_imports WHERE id=$1 AND user_id=$2 FOR UPDATE', [id,userId]);
        const batch = selected.rows[0];
        if (!batch) throw new HttpError(404, 'Import preview not found');
        if (batch.confirmed_at) return batch.result;
        if (new Date(batch.expires_at).getTime() < Date.now()) throw new HttpError(410, 'Import preview expired; upload again');
        if (batch.errors.length) throw new HttpError(409, 'Fix all preview errors before confirming');
        const rows: CatalogRow[] = batch.rows;
        await client.query('SELECT id FROM watches WHERE sku=ANY($1::text[]) ORDER BY id FOR UPDATE', [rows.map(row => row.sku)]);
        await mkdir(resolve(this.mediaDirectory), { recursive:true });
        const urls: Record<string,string> = Object.create(null);
        for (const [name,image] of Object.entries(batch.images) as [string,{ ext:string; data:string }][]) {
          const filename = `${randomUUID()}.${image.ext}`, path = join(resolve(this.mediaDirectory),filename);
          await writeFile(path,Buffer.from(image.data,'base64'), { flag:'wx' });
          written.push(path); urls[name] = `${this.mediaBaseUrl.replace(/\/$/,'')}/${filename}`;
        }
        let created = 0, updated = 0;
        const repository = this.catalog(client);
        for (const row of rows) {
          const current = await client.query('SELECT id FROM watches WHERE sku=$1', [row.sku]);
          const data = { ...row,imageUrl:urls[row.imageFilename] || row.imageUrl };
          if (current.rows.length) { await repository.update(current.rows[0].id,data); updated++; }
          else { await repository.create({ ...data,variants:[] } as Omit<Watch,'id'>); created++; }
        }
        const result = { imported:rows.length,created,updated };
        await client.query('UPDATE catalog_imports SET result=$2,confirmed_at=NOW(),images=$3 WHERE id=$1', [id,JSON.stringify(result),'{}']);
        return result;
      });
    } catch (error) { await Promise.all(written.map(path => unlink(path).catch(() => {}))); throw error; }
  }
}
