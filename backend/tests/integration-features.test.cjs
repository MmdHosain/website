const test = require('node:test');
const assert = require('node:assert/strict');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');
const { IntegrationService } = require('../dist/application/integrations/IntegrationService');
const { NotificationWorker } = require('../dist/application/integrations/NotificationWorker');
const { TelegramBot } = require('../dist/application/integrations/TelegramBot');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');
const { catalogFeed } = require('../dist/application/integrations/CatalogFeed');
const { enqueueNotification } = require('../dist/application/notifications/outbox');

test('integration sync, mapped variant prices, durable retry and idempotent authorized Telegram commands', async t => {
  const pg = new PGlite(); t.after(() => pg.close()); await applySchema(pg);
  const adapt = executor => async (sql, params = []) => { const result = await executor.query(sql, params); return { ...result, rowCount: result.affectedRows ?? result.rows.length }; };
  const db = { query: adapt(pg), transaction: work => pg.transaction(tx => work({ query: adapt(tx) })) };
  const watch = (await pg.query(`INSERT INTO watches(name,description,price,image_url,category,stock_quantity,sale_price,sale_starts_at,sale_ends_at)
    VALUES('Watch','Description',2000,'https://shop.example/watch.jpg','original',0,1000,NOW()-INTERVAL '1 day',NOW()+INTERVAL '1 day') RETURNING id`)).rows[0];
  const variant = (await pg.query("INSERT INTO watch_variants(watch_id,sku,label,price,stock_quantity) VALUES($1,'BLUE','Blue',3000,2) RETURNING id", [watch.id])).rows[0];
  const providers = {
    instagram: { configured: () => true, readPosts: async () => [{ id: '1', caption: 'Watch', permalink: 'https://instagram.com/p/abc', imageUrl: null, publishedAt: '2026-01-01' }] },
    prices: { configured: () => true, readPrices: async () => [{ watchId: watch.id, source: 'Shop', url: 'https://shop.example/watch', priceToman: 2500, observedAt: '2026-01-01' }] },
    basalam: { configured: () => true, publish: async products => { assert.equal(products[0].priceToman, 1500); } },
    notifications: { configured: () => true, send: async () => undefined },
  };
  const service = new IntegrationService(db, providers);
  await service.refresh('instagram'); assert.equal((await service.posts()).length, 1);
  await service.refresh('prices'); assert.equal((await service.prices.list())[0].difference, -500);
  await assert.rejects(service.mappings.save({ watchId: watch.id, externalId: 1 }), error => error.status === 400);
  await service.mappings.save({ watchId: watch.id, variantId: variant.id, externalId: 1 }); await service.refresh('basalam');
  const feed = await catalogFeed(db, 'https://store.example'); assert.equal(feed[0].current_price, 1500); assert.equal(feed[0].product_group_id, watch.id);
  let fail = true, deliveries = 0;
  const worker = new NotificationWorker(db, { configured: () => true, send: async () => { deliveries++; if (fail) throw new Error('provider secret'); } });
  await enqueueNotification(db, { kind: 'order_status_sms', recipient: '09123456789', payload: {}, dedupeKey: 'once' });
  await enqueueNotification(db, { kind: 'order_status_sms', recipient: '09123456789', payload: {}, dedupeKey: 'once' });
  await worker.run(); const failed = (await pg.query('SELECT * FROM notification_outbox')).rows[0];
  assert.equal(failed.status, 'failed'); assert.ok(!failed.last_error.includes('secret'));
  await worker.run(); assert.equal(deliveries, 1, 'backoff prevents immediate retry');
  await pg.query("UPDATE notification_outbox SET next_attempt_at=NOW()-INTERVAL '1 minute'"); fail = false; await worker.run(); await worker.run(); assert.equal(deliveries, 2);
  const bot = new TelegramBot(db, { list: async () => [] }, new PostgresWatchRepository(db), { TELEGRAM_ADMIN_CHAT_IDS: '123' });
  const update = { update_id: 1, message: { chat: { id: 123, type: 'private' }, from: { id: 123 }, text: '/orders' } };
  await bot.handle(update); await bot.handle(update);
  assert.equal((await pg.query("SELECT count(*)::int AS count FROM notification_outbox WHERE kind='telegram_reply'")).rows[0].count, 1);
  await assert.rejects(bot.handle({ ...update, update_id: 2, message: { ...update.message, from: { id: 999 } } }), error => error.status === 403);
});
