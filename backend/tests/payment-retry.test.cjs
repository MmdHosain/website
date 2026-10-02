const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { OrderService } = require('../dist/application/services/OrderService');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');
const { createApp } = require('../dist/presentation/app');

test('failed and expired payments resume safely, retain old callbacks, and flag duplicate verified receipts', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await require('./helpers/schema.cjs').applySchema(pg);
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const user = (await pg.query("INSERT INTO users(mobile) VALUES('09125555555') RETURNING id")).rows[0];
  const watch = (await pg.query("INSERT INTO watches(name,description,price,image_url,category) VALUES('Test','Example watch',3000000,'/watch.svg','original') RETURNING id")).rows[0];
  const body = { items: [{ watchId: watch.id, quantity: 1 }], customer: { name: 'Test Customer', address: '123 Example Street', city: 'Tehran', postalCode: '1234567890' }, expectedTotal: 3000000 };
  const attempts = new Map();
  let requested = 0;
  let verifications = 0;
  const providerError = (code, message = 'Unpaid') => Object.assign(new Error(message), { status: 502, providerCode: code });
  const gateway = {
    requestPayment: async () => {
      const authority = 'S' + String(++requested).padStart(35, '0');
      attempts.set(authority, { status: 'IN_BANK', refId: null });
      return { authority, paymentUrl: `https://sandbox.zarinpal.com/pg/StartPay/${authority}` };
    },
    verifyPayment: async ({ authority, amount }) => {
      verifications++;
      assert.equal(amount, 3000000);
      const state = attempts.get(authority);
      if (state.networkFailure) throw new Error('Network unavailable');
      if (state.invalid) throw providerError(-54, 'Invalid authority');
      if (!state.refId) throw providerError(-51);
      return { refId: state.refId };
    },
    inquirePayment: async ({ authority }) => {
      const state = attempts.get(authority);
      if (state.invalid) throw providerError(-54, 'Invalid authority');
      return { status: state.status };
    },
  };
  const orders = new OrderService(gateway, db, client => new PostgresWatchRepository(client));
  const initial = await orders.create(user.id, '09125555555', randomUUID(), body);
  const first = [...attempts.keys()][0];
  const inBank = await orders.resume(user.id, '09125555555', initial.order.id);
  assert.equal(inBank.paymentUrl, initial.paymentUrl);
  assert.equal(requested, 1, 'an in-progress payment must reuse its authority');
  attempts.get(first).status = 'FAILED';
  const retry = await orders.resume(user.id, '09125555555', initial.order.id);
  const second = [...attempts.keys()][1];
  assert.notEqual(retry.paymentUrl, initial.paymentUrl);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM payment_attempts WHERE order_id=$1', [initial.order.id])).rows[0].count, 2);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM orders')).rows[0].count, 1, 'retry does not duplicate the order');

  // Even a late callback for a replaced authority remains reconciled to the original order.
  attempts.get(first).refId = '10001';
  assert.equal((await orders.callback(first, true)).paid, true);
  let stored = await orders.detail(user.id, initial.order.id);
  assert.equal(stored.paymentRefId, '10001');
  attempts.get(second).refId = '10002';
  const verificationCount = verifications;
  const callbacks = await Promise.all([orders.callback(second, true), orders.callback(second, true)]);
  assert.ok(callbacks.every(result => result.paid));
  assert.equal(verifications, verificationCount + 1, 'simultaneous duplicate callbacks share one verification');
  stored = await orders.detail(user.id, initial.order.id);
  assert.equal(stored.paymentRefId, '10001', 'a second receipt cannot overwrite the first receipt');
  assert.equal(stored.paymentReview, true);
  const adminOrder = (await orders.list()).find(order => order.id === initial.order.id);
  assert.deepEqual(new Set(adminOrder.paymentReferences), new Set(['10001', '10002']));
  await assert.rejects(orders.setStatus(initial.order.id, 'confirmed'), error => error.status === 409);

  const expiredOrder = await orders.create(user.id, '09125555555', randomUUID(), body);
  const expiredAuthority = [...attempts.keys()].at(-1);
  attempts.get(expiredAuthority).invalid = true;
  const expiredRetry = await orders.resume(user.id, '09125555555', expiredOrder.order.id);
  assert.notEqual(expiredRetry.paymentUrl, expiredOrder.paymentUrl, 'both provider methods confirming invalid permits a new attempt');
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM payment_attempts WHERE order_id=$1', [expiredOrder.order.id])).rows[0].count, 2);

  const unknownOrder = await orders.create(user.id, '09125555555', randomUUID(), body);
  const unknownAuthority = [...attempts.keys()].at(-1);
  attempts.get(unknownAuthority).networkFailure = true;
  const requestCount = requested;
  await assert.rejects(orders.resume(user.id, '09125555555', unknownOrder.order.id), /Network/);
  assert.equal(requested, requestCount, 'an uncertain gateway result cannot create another charge');
  attempts.get(unknownAuthority).networkFailure = false;
  attempts.get(unknownAuthority).status = 'PAID';
  await assert.rejects(orders.resume(user.id, '09125555555', unknownOrder.order.id));
  assert.equal((await orders.detail(user.id, unknownOrder.order.id)).status, 'pending_payment', 'inquiry alone never proves payment');
  attempts.get(unknownAuthority).status = 'REVERSED';
  await assert.rejects(orders.resume(user.id, '09125555555', unknownOrder.order.id), error => error.status === 409);
  assert.equal(requested, requestCount);
});

test('reverse proxy trust is disabled by default and accepts only bounded hop counts', () => {
  const original = process.env.TRUST_PROXY;
  try {
    delete process.env.TRUST_PROXY;
    assert.equal(createApp().get('trust proxy'), false);
    process.env.TRUST_PROXY = '1';
    assert.equal(createApp().get('trust proxy'), 1);
    for (const invalid of ['true', '-1', '6', 'all']) {
      process.env.TRUST_PROXY = invalid;
      assert.throws(() => createApp(), /TRUST_PROXY/);
    }
  } finally {
    if (original === undefined) delete process.env.TRUST_PROXY; else process.env.TRUST_PROXY = original;
  }
});
