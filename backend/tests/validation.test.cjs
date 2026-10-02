const test = require('node:test');
const assert = require('node:assert/strict');
const { mobileNumber, orderInput, watchData, uuid } = require('../dist/application/validation');
const { validTransition } = require('../dist/application/services/OrderService');
const { AuthService, tokenHash } = require('../dist/application/services/AuthService');
const { HttpOtpProvider } = require('../dist/infrastructure/providers/HttpOtpProvider');

const watchId = '1e54fdb8-14e8-4b70-80e7-8fb3caa5d2a2';
const customer = { name: 'Test Customer', address: '12 Example Street', city: 'Tehran', postalCode: '1234567890' };

test('Iranian mobile formats normalize to one account including Persian and Arabic digits', () => {
  for (const input of ['۰۹۱۲۳۴۵۶۷۸۹', '٠٩١٢٣٤٥٦٧٨٩', '+98 (912) 345-6789', '00989123456789', '989123456789']) {
    assert.equal(mobileNumber(input), '09123456789');
  }
  for (const input of ['0912', '091234567890', '+1 9123456789', 9123456789, 'abc09123456789']) {
    assert.throws(() => mobileNumber(input), error => error.status === 400);
  }
});

test('legacy PostgreSQL catalog UUIDs stay addressable while checkout keys use standard UUIDs', () => {
  const legacyId = 'e645cffb-3d4e-c9e1-0c13-c3bef645a9ec';
  assert.equal(uuid(legacyId), legacyId);
  assert.throws(() => uuid(legacyId, 'Idempotency-Key', true), error => error.status === 400);
  assert.equal(uuid(watchId, 'Idempotency-Key', true), watchId);
  assert.throws(() => uuid("e645cffb';DROP TABLE watches"), error => error.status === 400);
});

test('checkout rejects invalid quantities and duplicate items, and normalizes customer data', () => {
  const input = { items: [{ watchId, quantity: 2 }], customer: { ...customer, postalCode: '۱۲۳۴۵۶۷۸۹۰' }, lang: 'fa', expectedTotal: 4000000 };
  assert.equal(orderInput(input).customer.postalCode, customer.postalCode);
  assert.equal(orderInput(input).customer.email, '');
  assert.equal(orderInput(input).expectedTotal, 4000000);
  for (const quantity of [0, -1, 21, 1.5, '2']) {
    assert.throws(() => orderInput({ ...input, items: [{ watchId, quantity }] }), error => error.status === 400);
  }
  assert.throws(() => orderInput({ ...input, items: [input.items[0], input.items[0]] }), /Duplicate/);
  assert.throws(() => orderInput({ ...input, customer: { ...customer, postalCode: '1234' } }), error => error.status === 400);
  assert.throws(() => orderInput({ ...input, expectedTotal: '4000000' }), error => error.status === 400);
});

test('catalog accepts whole toman prices and rejects script URLs', () => {
  const input = { name: 'Example', description: 'A watch', price: 3500000, imageUrl: '/images/watch.svg', category: 'original' };
  assert.equal(watchData(input).price, 3500000);
  for (const imageUrl of ['javascript:alert(1)', 'data:image/png;base64,x', '//unknown.test/a']) {
    assert.throws(() => watchData({ ...input, imageUrl }), error => error.status === 400);
  }
  assert.throws(() => watchData({ ...input, price: 15.5 }), error => error.status === 400);
  assert.throws(() => watchData({ ...input, category: 'fake' }), error => error.status === 400);
});

test('admin cannot manufacture a paid order or reverse fulfillment', () => {
  assert.equal(validTransition('pending_payment', 'paid'), false);
  assert.equal(validTransition('paid', 'confirmed'), true);
  assert.equal(validTransition('confirmed', 'shipped'), true);
  assert.equal(validTransition('shipped', 'confirmed'), false);
  assert.equal(validTransition('paid', 'cancelled'), true);
});

test('forged legacy bearer payload is rejected before database lookup', async () => {
  const db = { query: async () => { throw new Error('Database must not receive forged token'); } };
  const auth = new AuthService({ sendOtp: async () => true }, db);
  const forged = Buffer.from(JSON.stringify({ id: watchId, role: 'admin' })).toString('base64');
  await assert.rejects(auth.authenticate(forged), error => error.status === 401);
  const token = 'a'.repeat(43);
  let storedHash;
  const validFormatAuth = new AuthService({ sendOtp: async () => true }, { query: async (_sql, params) => { storedHash = params[0]; return { rows: [] }; } });
  await assert.rejects(validFormatAuth.authenticate(token), error => error.status === 401);
  assert.equal(storedHash, tokenHash(token));
  assert.notEqual(storedHash, token);
});

test('production OTP response is private and insecure provider configuration fails closed', async () => {
  const original = { nodeEnv: process.env.NODE_ENV, url: process.env.OTP_PROVIDER_URL, token: process.env.OTP_PROVIDER_TOKEN };
  try {
    process.env.NODE_ENV = 'production';
    let delivered;
    let stored;
    const db = { transaction: async work => work({ query: async (sql, params) => {
      if (sql.startsWith('INSERT INTO otps')) stored = params;
      return { rows: [] };
    } }) };
    const auth = new AuthService({ sendOtp: async (_mobile, code) => { delivered = code; return true; } }, db);
    assert.deepEqual(await auth.requestOtp('09123456789'), { success: true });
    assert.match(delivered, /^\d{6}$/);
    assert.ok(!stored.includes(delivered));
    process.env.OTP_PROVIDER_URL = 'http://sms.example.test';
    process.env.OTP_PROVIDER_TOKEN = 'example';
    await assert.rejects(new HttpOtpProvider().sendOtp('09123456789', '123456'), error => error.status === 503);
  } finally {
    for (const [key, value] of [['NODE_ENV', original.nodeEnv], ['OTP_PROVIDER_URL', original.url], ['OTP_PROVIDER_TOKEN', original.token]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
