const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');
const { OrderService } = require('../dist/application/services/OrderService');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');

test('pending cancellation reconciles invalid authorities and releases variant stock/coupon exactly once', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await applySchema(pg);
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const user = (await pg.query("INSERT INTO users(mobile) VALUES('09126666666') RETURNING *")).rows[0];
  const watch = (await pg.query(`INSERT INTO watches(name,description,price,image_url,category)
    VALUES('Cancellation watch','Example watch',3000000,'/watch.svg','original') RETURNING id`)).rows[0];
  const variant = (await pg.query(`INSERT INTO watch_variants(watch_id,sku,label,price,stock_quantity)
    VALUES($1,'CANCEL-BLUE','Blue',4000000,1) RETURNING id`, [watch.id])).rows[0];
  await pg.query(`INSERT INTO discount_codes(code,type,value,starts_at,ends_at,usage_limit)
    VALUES('CANCELTEST','fixed',100000,NOW()-INTERVAL '1 day',NOW()+INTERVAL '1 day',1)`);
  const providerError = code => Object.assign(new Error('Provider rejected reference'), { status: 502, providerCode: code });
  let verifyCode = -51;
  let inquiryCode = null;
  let inquiryStatus = 'IN_BANK';
  let verifications = 0;
  const authority = 'S' + '6'.repeat(35);
  const gateway = {
    requestPayment: async () => ({ authority, paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}` }),
    verifyPayment: async () => { verifications++; throw providerError(verifyCode); },
    inquirePayment: async () => { if (inquiryCode) throw providerError(inquiryCode); return { status: inquiryStatus }; },
  };
  const orders = new OrderService(gateway, db, client => new PostgresWatchRepository(client));
  const created = await orders.create(user.id,user.mobile,randomUUID(), {
    items: [{ watchId: watch.id, variantId: variant.id, quantity: 1 }], couponCode: 'CANCELTEST',
    customer: { name: 'Test Customer', address: '123 Example Street', city: 'Tehran', postalCode: '1234567890' },
  });
  const stored = async () => (await pg.query(`SELECT orders.status,inventory_state,coupon_state,
    (SELECT stock_quantity FROM watch_variants WHERE id=$2) AS stock,
    (SELECT used_count FROM discount_codes WHERE code='CANCELTEST') AS usage
    FROM orders WHERE id=$1`, [created.order.id,variant.id])).rows[0];
  const reserved = { status: 'pending_payment', inventory_state: 'reserved', coupon_state: 'reserved', stock: 0, usage: 1 };
  assert.deepEqual(await stored(), reserved);
  await assert.rejects(orders.setStatus(created.order.id,'cancelled'), error => error.status === 409);
  assert.deepEqual(await stored(), reserved, 'IN_BANK must retain the reservation');
  verifyCode = -54;
  await assert.rejects(orders.setStatus(created.order.id,'cancelled'), error => error.status === 409);
  assert.deepEqual(await stored(), reserved, 'invalid verification cannot override an active inquiry');
  verifyCode = -51; inquiryCode = -54;
  await assert.rejects(orders.setStatus(created.order.id,'cancelled'), error => error.providerCode === -54);
  assert.deepEqual(await stored(), reserved, 'one invalid result is insufficient');
  verifyCode = -54; inquiryCode = null; inquiryStatus = 'REVERSED';
  await assert.rejects(orders.setStatus(created.order.id,'cancelled'), error => error.status === 409);
  assert.deepEqual(await stored(), reserved, 'unresolved payment review cannot release stock');
  inquiryCode = -54;
  const cancelled = await orders.setStatus(created.order.id,'cancelled');
  assert.equal(cancelled.status,'cancelled');
  assert.equal(cancelled.refundDue,0);
  assert.deepEqual(await stored(), { status: 'cancelled', inventory_state: 'released', coupon_state: 'released', stock: 1, usage: 0 });
  const checks = verifications;
  await orders.setStatus(created.order.id,'cancelled');
  assert.equal(verifications,checks,'repeated cancellation is idempotent');
  assert.deepEqual(await stored(), { status: 'cancelled', inventory_state: 'released', coupon_state: 'released', stock: 1, usage: 0 });
  const notifications = await pg.query("SELECT count(*)::int AS count FROM notification_outbox WHERE dedupe_key=$1", [`order:${created.order.id}:status:cancelled`]);
  assert.equal(notifications.rows[0].count,1);
});
