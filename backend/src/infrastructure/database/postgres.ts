import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { mobileNumber } from '../../application/validation';
import { applySchema } from './migrate';
import type { Database, QueryExecutor } from '../../domain/ports/Database';
export type { Database } from '../../domain/ports/Database';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  statement_timeout: 30_000,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export async function transaction<T>(work: (client: QueryExecutor) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
export const database: Database = { query, transaction };
export async function initDb(): Promise<void> {
  const seeds = await readFile(resolve(__dirname, 'init.sql'), 'utf8');
  await transaction(async client => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext('watch-shop-schema'))");
    await applySchema(client);
    if (process.env.SEED_CATALOG !== 'false') await client.query(seeds);
    const admins = (process.env.ADMIN_MOBILES ?? (process.env.NODE_ENV === 'production' ? '' : '09123456789')).split(',').map(m => m.trim()).filter(Boolean).map(mobileNumber);
    await client.query("UPDATE users SET role='admin' WHERE mobile=ANY($1::text[])", [admins]);
  });
}
