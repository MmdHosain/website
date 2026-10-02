const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { createApp } = require('../dist/presentation/app');
const { AuthService } = require('../dist/application/services/AuthService');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');

test('MVP API: OTP sessions, catalog permissions, order pricing, payment verification, history and forms', async t => {
  process.env.ADMIN_MOBILES = '09123456789';
  process.env.NODE_ENV = 'test';
  const pg = new PGlite();
  await require('./helpers/schema.cjs').applySchema(pg);
  const seed = await readFile(join(__dirname, '../src/infrastructure/database/init.sql'), 'utf8');
  await pg.exec(seed);
  const count = (await pg.query('SELECT count(*)::int AS count FROM watches')).rows[0].count;
  await pg.exec(seed);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM watches')).rows[0].count, count, 'seeding must not duplicate or delete watches');
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params);
    return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const auth = new AuthService({ sendOtp: async () => true }, db);
  let requested = 0;
  let verified = false;
  const gateway = {
    requestPayment: async input => { requested++; assert.ok(input.amount >= 1000); return { authority: 'S' + String(requested).padStart(35, '0'), paymentUrl: 'https://sandbox.zarinpal.com/pg/StartPay/S' + String(requested).padStart(35, '0') }; },
    verifyPayment: async () => { if (!verified) { const error = new Error('Unpaid'); error.providerCode = -51; throw error; } return { refId: '123456' }; },
  };
  const repository = {
    findAll: async () => (await db.query('SELECT * FROM watches')).rows.map(row => ({ id: row.id, name: row.name, description: row.description, price: Number(row.price), imageUrl: row.image_url, category: row.category })),
    findById: async id => (await repository.findAll()).find(watch => watch.id === id) || null,
    create: async watch => { const rows = await db.query('INSERT INTO watches(name,description,price,image_url,category) VALUES($1,$2,$3,$4,$5) RETURNING *', [watch.name, watch.description, watch.price, watch.imageUrl, watch.category]); return repository.findById(rows.rows[0].id); },
    update: async (id, data) => { const current = await repository.findById(id); if (!current) return null; const next = { ...current, ...data }; await db.query('UPDATE watches SET name=$2,description=$3,price=$4,image_url=$5,category=$6 WHERE id=$1', [id,next.name,next.description,next.price,next.imageUrl,next.category]); return repository.findById(id); },
    delete: async id => { const result = await db.query('DELETE FROM watches WHERE id=$1 RETURNING id', [id]); return !!result.rows.length; },
  };
  const server = createApp({ db, auth, gateway, watchRepository: repository }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await pg.close(); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const api = async (path, { token, method = 'GET', body, key, headers = {}, redirect } = {}) => {
    const response = await fetch(base + path, { method, redirect, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(key ? { 'Idempotency-Key': key } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => null);
    return { status: response.status, data, headers: response.headers };
  };
  async function login(mobile) {
    const sent = await api('/api/auth/request-otp', { method: 'POST', body: { mobile } });
    assert.equal(sent.status, 200);
    assert.match(sent.data.devOtp, /^\d{6}$/);
    const response = await api('/api/auth/verify-otp', { method: 'POST', body: { mobile, code: sent.data.devOtp } });
    assert.equal(response.status, 200);
    return { ...response.data, code: sent.data.devOtp };
  }
  const customer = await login('۰۹۱۲۱۱۱۱۱۱۱');
  const admin = await login('09123456789');
  const other = await login('09122222222');
  assert.equal(customer.user.mobile, '09121111111');
  assert.equal(admin.user.role, 'admin');
  assert.equal((await api('/api/auth/request-otp', { method: 'POST', body: { mobile: '09121111111' } })).status, 200); // consumed OTP may be requested again
  assert.equal((await api('/api/auth/request-otp', { method: 'POST', body: { mobile: '09121111111' } })).status, 429);
  assert.equal((await api('/api/auth/verify-otp', { method: 'POST', body: { mobile: '09123456789', code: admin.code } })).status, 400, 'OTP cannot be replayed');
  assert.equal((await api('/api/auth/me', { token: Buffer.from(JSON.stringify({ role: 'admin' })).toString('base64') })).status, 401);
  const watches = (await api('/api/watches')).data;
  assert.equal(watches.length, count);
  const watch = watches.find(watch => watch.category === 'highcopy');
  assert.equal((await api('/api/watches', { method: 'POST', body: watch })).status, 401);
  assert.equal((await api('/api/watches', { method: 'POST', token: customer.token, body: watch })).status, 403);
  const product = { name: 'MVP Test Watch', description: 'Test watch for checkout', price: 3000000, imageUrl: 'https://example.com/watch.jpg', category: 'original' };
  const created = await api('/api/watches', { method: 'POST', token: admin.token, body: product });
  assert.equal(created.status, 201);
  assert.equal((await api('/api/watches/not-a-uuid')).status, 400);
  const key = randomUUID();
  const body = { items: [{ watchId: created.data.id, quantity: 2 }], customer: { name: 'Test Customer', email: 'buyer@example.com', address: '42 Test Street', city: 'Tehran', postalCode: '1234567890', notes: '' }, lang: 'fa', expectedTotal: 6000000 };
  assert.equal((await api('/api/orders', { method: 'POST', body, key })).status, 401);
  const checkout = await api('/api/orders', { method: 'POST', token: customer.token, body: { ...body, total: 1 }, key });
  assert.equal(checkout.status, 201);
  assert.equal(checkout.data.order.total, 6000000, 'server catalog prices control the charge');
  assert.equal(checkout.data.order.currency, 'IRT');
  assert.equal(checkout.data.order.status, 'pending_payment');
  const orderId = checkout.data.order.id;
  const replay = await api('/api/orders', { method: 'POST', token: customer.token, body: { ...body, total: 9999 }, key });
  assert.equal(replay.status, 200);
  assert.equal(replay.data.order.id, orderId);
  assert.equal(requested, 1, 'idempotent checkout must not create another payment');
  assert.equal((await api('/api/orders', { method: 'POST', token: customer.token, body: { ...body, items: [{ watchId: created.data.id, quantity: 1 }] }, key })).status, 409);
  assert.equal((await api('/api/orders/' + orderId, { token: other.token })).status, 404);
  assert.equal((await api('/api/admin/orders', { token: customer.token })).status, 403);
  assert.equal((await api('/api/admin/orders/' + orderId, { method: 'PATCH', token: admin.token, body: { status: 'paid' } })).status, 409);
  const authority = 'S' + String(requested).padStart(35, '0');
  const forged = await api('/api/payments/zarinpal/callback?Authority=' + authority + '&Status=OK', { redirect: 'manual' });
  assert.equal(forged.status, 303);
  assert.equal((await api('/api/orders/' + orderId, { token: customer.token })).data.status, 'pending_payment', 'query Status=OK alone cannot mark paid');
  verified = true;
  await api('/api/payments/zarinpal/callback?Authority=' + authority + '&Status=OK', { redirect: 'manual' });
  await api('/api/payments/zarinpal/callback?Authority=' + authority + '&Status=OK', { redirect: 'manual' });
  assert.equal((await api('/api/orders/' + orderId, { token: customer.token })).data.status, 'paid');
  assert.equal((await api('/api/admin/orders/' + orderId, { method: 'PATCH', token: admin.token, body: { status: 'confirmed' } })).status, 200);
  assert.equal((await api('/api/admin/orders/' + orderId, { method: 'PATCH', token: admin.token, body: { status: 'shipped' } })).status, 200);
  assert.equal((await api('/api/orders', { token: customer.token })).data.length, 1);
  assert.equal((await api('/api/orders', { token: other.token })).data.length, 0);
  assert.equal((await api('/api/concierge', { method: 'POST', body: { name: 'Test Buyer', email: 'buyer@example.com', model: 'Rare watch', message: 'Please source this watch for me', lang: 'fa' } })).status, 201);
  assert.equal((await api('/api/admin/concierge', { token: admin.token })).data.length, 1);
  for (let i = 0; i < 2; i++) assert.equal((await api('/api/newsletter', { method: 'POST', body: { email: 'NEWS@example.com', lang: 'en' } })).status, 200);
  assert.equal((await api('/api/admin/newsletter', { token: admin.token })).data.length, 1);
  assert.equal((await api('/api/newsletter', { method: 'POST', body: { email: 'invalid' } })).status, 400);
  assert.equal((await api('/api/auth/logout', { method: 'POST', token: customer.token })).status, 204);
  assert.equal((await api('/api/auth/me', { token: customer.token })).status, 401);
  const preflight = await api('/api/orders', { method: 'OPTIONS', headers: { Origin: 'http://localhost:3000' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'http://localhost:3000');
});

