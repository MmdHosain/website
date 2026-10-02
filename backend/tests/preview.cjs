// Temporary local QA server. Production always uses PostgreSQL and the real gateway.
// PREVIEW_MOCK_PAYMENTS=true enables only the injected test gateway in this file.
const { PGlite } = require('@electric-sql/pglite');
const { readFile, mkdir } = require('node:fs/promises');
const { join, dirname } = require('node:path');
const { randomBytes } = require('node:crypto');
const { createApp } = require('../dist/presentation/app');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');
(async () => {
  if (process.env.NODE_ENV === 'production') throw new Error('QA preview is disabled in production');
  const dataDirectory = process.env.PREVIEW_DATA_DIRECTORY || join(__dirname, '../../.preview-db/store');
  const port = Number(process.env.PREVIEW_PORT || 4000);
  if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid QA preview port');
  await mkdir(dirname(dataDirectory), { recursive: true });
  const pg = new PGlite(dataDirectory);
  await require('./helpers/schema.cjs').applySchema(pg);
  await pg.exec(await readFile(join(__dirname, '../src/infrastructure/database/init.sql'), 'utf8'));
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const gateway = process.env.PREVIEW_MOCK_PAYMENTS === 'true' ? {
    requestPayment: async () => { const authority = 'S' + randomBytes(18).toString('hex').slice(0,35); return { authority, paymentUrl: 'https://sandbox.zarinpal.com/pg/StartPay/' + authority }; },
    verifyPayment: async () => ({ refId: '999999' }),
  } : undefined;
  const app = createApp({ db, gateway, watchRepository: new PostgresWatchRepository(db) });
  const server = app.listen(port, '127.0.0.1', () => console.log(`Local QA API http://localhost:${port}; persistent local data; mock payments=${!!gateway}`));
  const stop = () => server.close(async () => { await pg.close(); process.exit(0); });
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
