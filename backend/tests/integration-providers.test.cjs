const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync, sign } = require('node:crypto');
const { validateTorobToken } = require('../dist/presentation/integrations/torobAuth');
const { InstagramProvider } = require('../dist/infrastructure/integrations/InstagramProvider');
const { BasalamProvider } = require('../dist/infrastructure/integrations/BasalamProvider');
const { PriceReportProvider } = require('../dist/infrastructure/integrations/PriceReportProvider');
const { NotificationProvider } = require('../dist/infrastructure/integrations/NotificationProvider');
const { selectFeed } = require('../dist/application/integrations/CatalogFeed');
const { jsonHttp } = require('../dist/infrastructure/integrations/jsonHttp');
const json = value => new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } });

test('Torob verifies EdDSA signatures, exact audience and required time claims', () => {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const key = publicKey.export({ type: 'spki', format: 'pem' });
  function token(claims, header = { alg: 'EdDSA', v: 1 }) {
    const body = [header, claims].map(value => Buffer.from(JSON.stringify(value)).toString('base64url')).join('.');
    return body + '.' + sign(null, Buffer.from(body), privateKey).toString('base64url');
  }
  const claims = { aud: 'shop.example', exp: 200, nbf: 50 };
  validateTorobToken(token(claims), '1', 'shop.example', key, 100);
  for (const changed of [{ ...claims, aud: 'other.example' }, { ...claims, exp: 99 }, { ...claims, nbf: 101 }, { ...claims, exp: undefined }]) {
    assert.throws(() => validateTorobToken(token(changed), '1', 'shop.example', key, 100), error => error.status === 401);
  }
  assert.throws(() => validateTorobToken(token(claims, { alg: 'HS256', v: 1 }), '1', 'shop.example', key, 100));
  assert.throws(() => validateTorobToken(token(claims).slice(0, -4) + 'abcd', '1', 'shop.example', key, 100));
});

test('feed supports identifier/page/cursor modes, invalid requests fail closed', () => {
  const products = Array.from({ length: 205 }, (_, index) => ({ page_unique: String(index).padStart(3, '0'), page_url: `https://shop.example/${index}`, date_added: String(index).padStart(3, '0'), date_updated: String(index).padStart(3, '0') }));
  assert.equal(selectFeed(products, { page: 2, sort: 'date_added_desc' }).products.length, 100);
  assert.equal(selectFeed(products, { page_uniques: ['003'] }).products[0].page_unique, '003');
  assert.equal(selectFeed(products, { page_urls: ['https://shop.example/deleted'] }).products.length, 0);
  const first = selectFeed(products, { sort: 'product_id_desc' });
  const next = selectFeed(products, { sort: 'product_id_desc', cursor: first.next_cursor });
  assert.equal(next.products.length, 100); assert.notEqual(next.products[0].page_unique, first.products[0].page_unique);
  assert.throws(() => selectFeed(products, {}));
  assert.throws(() => selectFeed(products, { page: 1, cursor: '003', sort: 'product_id_desc' }));
});

test('Instagram remains disabled until fully configured and filters unsafe or unavailable media', async () => {
  assert.equal(new InstagramProvider({}).configured(), false);
  const provider = new InstagramProvider({ INSTAGRAM_ENABLED: 'true', INSTAGRAM_ACCESS_TOKEN: 'secret', INSTAGRAM_USER_ID: '123', INSTAGRAM_API_VERSION: 'v26.0' }, async (url, init) => {
    assert.equal(new URL(url).hostname, 'graph.instagram.com'); assert.equal(init.headers.Authorization, 'Bearer secret');
    assert.ok(!url.includes('secret'));
    return json({ data: [
      { id: '456', caption: 'Watch', permalink: 'https://www.instagram.com/p/abc/', timestamp: '2026-01-01', media_type: 'VIDEO' },
      { id: '789', permalink: 'javascript:alert(1)', timestamp: '2026-01-01' },
    ] });
  });
  const posts = await provider.readPosts(); assert.equal(posts.length, 1); assert.equal(posts[0].imageUrl, null);
});

test('Basalam requires explicit unit selection and verifies every batch result', async () => {
  const env = { BASALAM_ENABLED: 'true', BASALAM_ACCESS_TOKEN: 'secret', BASALAM_VENDOR_ID: '99', BASALAM_PRICE_UNIT: 'rial' };
  const products = [{ watchId: 'watch', variantId: null, externalId: 7, priceToman: 1000, stock: 2 }];
  assert.equal(new BasalamProvider({ ...env, BASALAM_PRICE_UNIT: '' }).configured(), false);
  await new BasalamProvider(env, async (url, init) => {
    assert.equal(url, 'https://openapi.basalam.com/v1/vendors/99/products/batch-updates');
    assert.deepEqual(JSON.parse(init.body), { data: [{ id: 7, stock: 2, primary_price: 10000 }] }); return json([{ id: 7, has_error: false }]);
  }).publish(products);
  await assert.rejects(new BasalamProvider(env, async () => json([{ id: 7, has_error: true }])).publish(products));
});

test('price bridge rejects mismatched watches and outbound notifications retain idempotency', async () => {
  const prices = new PriceReportProvider({ PRICE_REPORT_ENABLED: 'true', PRICE_REPORT_URL: 'https://prices.example/api' }, async () => json({ observations: [{ watchId: 'other', source: 'Shop', url: 'https://shop.example/a', priceToman: 1000, observedAt: '2026-01-01' }] }));
  await assert.rejects(prices.readPrices([{ id: 'watch', name: 'Watch' }]));
  const sms = new NotificationProvider({ SMS_NOTIFICATIONS_ENABLED: 'true', SMS_PROVIDER_URL: 'https://sms.example/api' }, async (_url, init) => {
    assert.equal(init.headers['Idempotency-Key'], 'event'); assert.equal(JSON.parse(init.body).mobile, '09123456789'); return json({ success: true });
  });
  await sms.send({ id: 'event', kind: 'order_status_sms', recipient: '09123456789', payload: { orderId: 'order', status: 'shipped', lang: 'fa' } });
  await assert.rejects(jsonHttp('http://internal.example', {}, async () => json({})));
  const telegram = new NotificationProvider({ TELEGRAM_ENABLED: 'true', TELEGRAM_BOT_TOKEN: 'token', TELEGRAM_ADMIN_CHAT_IDS: '123' }, async () => { throw new Error('must not send'); });
  await assert.rejects(telegram.send({ id: 'event', kind: 'telegram_reply', recipient: '999', payload: {} }), error => error.status === 403);
});
