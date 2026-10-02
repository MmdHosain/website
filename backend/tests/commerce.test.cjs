const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');
const { OrderService } = require('../dist/application/services/OrderService');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');
const { AuthService } = require('../dist/application/services/AuthService');
const { hasPermission } = require('../dist/presentation/permissions');

test('server quotes sale/variant prices, shipping and limited coupons; inventory and notifications are transactional', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await applySchema(pg);
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params); return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const user = (await pg.query("INSERT INTO users(mobile,role) VALUES('09128888888','staff_catalog') RETURNING *")).rows[0];
  const watch = (await pg.query(`INSERT INTO watches(name,description,price,image_url,category,stock_quantity,sale_price,sale_starts_at,sale_ends_at)
    VALUES('Variant watch','Test watch',3000000,'/watch.svg','original',2,1500000,NOW()-INTERVAL '1 day',NOW()+INTERVAL '1 day') RETURNING id`)).rows[0];
  const variant = (await pg.query("INSERT INTO watch_variants(watch_id,sku,label,price,stock_quantity) VALUES($1,'TEST-BLUE','Blue',4000000,1) RETURNING id", [watch.id])).rows[0];
  await pg.query("UPDATE store_settings SET shipping_cost=100000");
  await pg.query(`INSERT INTO discount_codes(code,type,value,minimum_amount,maximum_discount,starts_at,ends_at,usage_limit)
    VALUES('WELCOME','fixed',500000,1000000,700000,NOW()-INTERVAL '1 day',NOW()+INTERVAL '1 day',1)`);
  let charges = 0;
  const paid = new Map();
  const gateway = {
    requestPayment: async ({ amount }) => { assert.ok(amount >= 1000); const authority = 'S' + String(++charges).padStart(35, '0'); return { authority, paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}` }; },
    verifyPayment: async ({ authority }) => { if (!paid.has(authority)) throw Object.assign(new Error('Unpaid'), { providerCode: -51 }); return { refId: paid.get(authority) }; },
    inquirePayment: async () => ({ status: 'FAILED' }),
  };
  const orders = new OrderService(gateway, db, client => new PostgresWatchRepository(client));
  const selected = { items: [{ watchId: watch.id, variantId: variant.id, quantity: 1 }], couponCode: 'welcome' };
  const quote = await orders.quote(selected);
  assert.deepEqual([quote.subtotal,quote.discount,quote.shipping,quote.total], [2000000,500000,100000,1600000]);
  assert.equal(quote.items[0].variantLabel, 'Blue');
  await assert.rejects(orders.quote({ items: [{ watchId: watch.id, quantity: 1 }] }), error => error.status === 400);
  const body = { ...selected, customer: { name: 'Test Customer', address: '123 Example Street', city: 'Tehran', postalCode: '1234567890' }, expectedTotal: quote.total };
  const key = randomUUID();
  await assert.rejects(orders.create(user.id,user.mobile,key,{ ...body, expectedTotal: 1 }), error => error.status === 409);
  assert.equal(charges, 0);
  const created = await orders.create(user.id,user.mobile,key,body);
  assert.equal(created.order.shipping, 100000);
  assert.equal((await pg.query('SELECT stock_quantity FROM watch_variants WHERE id=$1',[variant.id])).rows[0].stock_quantity,0);
  await orders.create(user.id,user.mobile,key,body);
  assert.equal(charges,1);
  await assert.rejects(orders.create(user.id,user.mobile,randomUUID(),body), error => error.status === 409);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM notification_outbox')).rows[0].count,2);
  await orders.setStatus(created.order.id,'cancelled');
  await orders.setStatus(created.order.id,'cancelled');
  assert.equal((await pg.query('SELECT stock_quantity FROM watch_variants WHERE id=$1',[variant.id])).rows[0].stock_quantity,1);
  assert.equal((await pg.query("SELECT used_count FROM discount_codes WHERE code='WELCOME'")).rows[0].used_count,0);
  assert.equal((await pg.query("SELECT count(*)::int AS count FROM notification_outbox WHERE dedupe_key LIKE '%status:cancelled'")).rows[0].count,1);
  const second = await orders.create(user.id,user.mobile,randomUUID(),body);
  const authority = 'S' + String(charges).padStart(35,'0'); paid.set(authority,'800001');
  await orders.callback(authority,true);
  assert.equal((await orders.detail(user.id,second.order.id)).status,'paid');
  await orders.setStatus(second.order.id,'cancelled');
  const cancelled = await orders.detail(user.id,second.order.id);
  assert.equal(cancelled.refundDue,1600000);
  assert.equal(cancelled.refundStatus,'due');
  assert.equal((await pg.query('SELECT stock_quantity FROM watch_variants WHERE id=$1',[variant.id])).rows[0].stock_quantity,1);
  await orders.callback(authority,true);
  assert.equal((await orders.detail(user.id,second.order.id)).status,'cancelled','a repeated callback cannot resurrect a cancelled order');
  await orders.markRefunded(second.order.id,'MANUAL-REFUND-800001');
  assert.equal((await orders.detail(user.id,second.order.id)).refundStatus,'refunded');
  assert.equal((await pg.query('SELECT stock_quantity FROM watch_variants WHERE id=$1',[variant.id])).rows[0].stock_quantity,1);
  const auth = new AuthService({ sendOtp: async () => true },db);
  const otp = await auth.requestOtp(user.mobile);
  const session = await auth.verifyOtp(user.mobile,otp.devOtp);
  assert.equal(session.user.role,'staff_catalog','stored scoped roles persist across login');
  assert.equal(hasPermission(session.user.role,'catalog'),true);
  assert.equal(hasPermission(session.user.role,'orders'),false);
  assert.equal(hasPermission(session.user.role,'roles'),false);
});
