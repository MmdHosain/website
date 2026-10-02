const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const cache = new Map();
function loadTs(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = new Module(filename);
  cache.set(filename, module);
  module.filename = filename;
  module.require = id => id.startsWith('.') ? loadTs(path.resolve(path.dirname(filename), id) + '.ts') : require(id);
  module._compile(compiled, filename);
  return module.exports;
}
const storage = loadTs(path.resolve(__dirname, '../components/checkout/storage.ts'));
const { trustedPaymentUrl } = loadTs(path.resolve(__dirname, '../services/order.service.ts'));
const { normalizeDigits } = loadTs(path.resolve(__dirname, '../components/checkout/copy.ts'));
const store = new Map();
global.sessionStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
const customer = { name: 'Buyer', email: '', address: '10 Test Street', city: 'Tehran', postalCode: '1234567890', notes: '' };
const request = { items: [{ watchId: 'b', quantity: 2 }, { watchId: 'a', quantity: 1 }], customer, expectedTotal: 3000000, lang: 'fa' };
test('checkout retries reuse a stable key but changed quantities and prices use a new key', () => {
  store.clear();
  const first = storage.getCheckoutAttempt(request);
  const reordered = storage.getCheckoutAttempt({ ...request, items: [...request.items].reverse() });
  assert.equal(first.key, reordered.key);
  assert.notEqual(storage.getCheckoutAttempt({ ...request, expectedTotal: 4000000 }).key, first.key);
  assert.notEqual(storage.getCheckoutAttempt({ ...request, items: [{ watchId: 'a', quantity: 3 }] }).key, first.key);
  assert.match(first.key, /^[0-9a-f-]{36}$/);
});
test('coupon and variant changes create distinct checkout attempts while variant line reordering stays stable', () => {
  store.clear();
  const variantRequest = { ...request, couponCode: 'WELCOME', items: [{ watchId: 'a', variantId: 'red', quantity: 1 }, { watchId: 'a', variantId: 'blue', quantity: 1 }] };
  const original = storage.getCheckoutAttempt(variantRequest);
  assert.equal(storage.getCheckoutAttempt({ ...variantRequest, items: [...variantRequest.items].reverse() }).key, original.key);
  assert.notEqual(storage.getCheckoutAttempt({ ...variantRequest, couponCode: 'ANOTHER' }).key, original.key);
  assert.notEqual(storage.getCheckoutAttempt({ ...variantRequest, items: [{ watchId: 'a', variantId: 'green', quantity: 1 }] }).key, original.key);
});
test('only the active checkout attempt is removed after an order is verified', () => {
  store.clear();
  const first = storage.getCheckoutAttempt(request);
  storage.saveAttemptOrder(first.key, 'order-1');
  const second = storage.getCheckoutAttempt({ ...request, expectedTotal: 4000000 });
  storage.saveAttemptOrder(second.key, 'order-2');
  assert.equal(storage.hasCheckoutAttempt('order-1'), true);
  storage.completeCheckoutAttempt('order-1');
  assert.equal(storage.hasCheckoutAttempt('order-1'), false);
  assert.equal(storage.hasCheckoutAttempt('order-2'), true);
});
test('malformed saved customer data is handled without executing or trusting it', () => {
  store.set(storage.DRAFT_KEY, '{broken');
  assert.deepEqual(storage.readCustomer(), storage.emptyCustomer);
  store.set(storage.DRAFT_KEY, JSON.stringify({ name: 123, postalCode: '1234567890' }));
  assert.equal(storage.readCustomer().name, '');
  assert.equal(storage.readCustomer().postalCode, '1234567890');
});
test('payment navigation permits only HTTPS Zarinpal checkout hosts', () => {
  const url = 'https://sandbox.zarinpal.com/pg/StartPay/S' + '0'.repeat(35);
  assert.equal(trustedPaymentUrl(url), url);
  for (const malicious of ['https://zarinpal.com.evil.test/pg/StartPay/A123', 'http://sandbox.zarinpal.com/pg/StartPay/A123', 'https://evil.test', 'javascript:alert(1)', 'https://user:password@payment.zarinpal.com/pg/StartPay/A123', 'https://payment.zarinpal.com:8443/pg/StartPay/A123', 'https://payment.zarinpal.com/wrong-path', null]) assert.throws(() => trustedPaymentUrl(malicious));
});
test('Iranian and Arabic numerals normalize for postal codes', () => assert.equal(normalizeDigits('۱۲۳۴۵٦٧٨٩٠'), '1234567890'));
test('a cancelled checkout can start a fresh attempt while keeping the shipping draft', () => {
  store.clear();
  store.set(storage.DRAFT_KEY, JSON.stringify(customer));
  const attempt = storage.getCheckoutAttempt(request);
  storage.saveAttemptOrder(attempt.key, 'cancelled-order');
  storage.abandonCheckoutAttempt('cancelled-order');
  assert.notEqual(storage.getCheckoutAttempt(request).key, attempt.key);
  assert.deepEqual(storage.readCustomer(), customer);
});
