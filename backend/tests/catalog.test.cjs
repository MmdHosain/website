const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const load = require('./helpers/load-source.cjs');
const { watchData } = load(path.resolve(__dirname, '../src/application/catalog/watchValidation.ts'));
const { searchCatalog } = load(path.resolve(__dirname, '../src/application/catalog/search.ts'));
const { resolveWatchSelection } = load(path.resolve(__dirname, '../src/application/catalog/selection.ts'));
const variantId = 'a925de94-9027-4a1a-b679-ad05a72b09e7';
const base = { id: 'c8131cc5-3b77-402e-8c13-e0a8347f1338', name: 'Rolex Datejust', description: 'Classic watch', price: 1000000, imageUrl: '/watch.svg', category: 'original', stockQuantity: 20, variants: [], salePrice: null, saleStartsAt: null, saleEndsAt: null };
test('live search tolerates Persian aliases and English/Persian typos and transpositions', () => {
  const watches = [base, { ...base, id: 'citizen', name: 'Citizen Eco Drive' }, { ...base, id: 'omega', name: 'Omega Speedmaster' }];
  for (const query of ['رولکس', 'رولگز', 'roelx', 'rolex datejst']) assert.equal(searchCatalog(watches, query)[0].id, base.id);
  for (const query of ['سیتی زن', 'سیتی‌زن', 'citizne']) assert.equal(searchCatalog(watches, query)[0].id, 'citizen');
  assert.equal(searchCatalog(watches, 'nonexistent watch model').length, 0);
});
test('variant selection has separate price/stock and requires a real stable ID', () => {
  const watch = { ...base, variants: [{ id: variantId, sku: 'BLACK', label: 'Black', price: 2000000, stockQuantity: 0 }] };
  assert.throws(() => resolveWatchSelection(watch), error => error.status === 400);
  assert.throws(() => resolveWatchSelection(watch, 'wrong'), error => error.status === 409);
  assert.equal(resolveWatchSelection(watch, variantId).stockQuantity, 0);
  assert.equal(resolveWatchSelection(watch, variantId).price, 2000000);
});
test('offer starts inclusive and ends exclusive with the same discount applied to variants', () => {
  const watch = { ...base, salePrice: 750000, saleStartsAt: '2026-10-02T10:00:00.000Z', saleEndsAt: '2026-10-02T11:00:00.000Z', variants: [{ id: variantId, sku: 'BLACK', label: 'Black', price: 2000000, stockQuantity: 2 }] };
  assert.equal(resolveWatchSelection(watch, variantId, new Date('2026-10-02T09:59:59Z')).price, 2000000);
  assert.equal(resolveWatchSelection(watch, variantId, new Date(watch.saleStartsAt)).price, 1500000);
  assert.equal(resolveWatchSelection(watch, variantId, new Date(watch.saleEndsAt)).price, 2000000);
});
test('admin validation rejects negative stock, duplicate variants and invalid sale schedules', () => {
  assert.equal(watchData(base).stockQuantity, 20);
  assert.throws(() => watchData({ ...base, stockQuantity: -1 }));
  const variant = { id: variantId, sku: 'A', label: 'A', price: 1000, stockQuantity: 2 };
  assert.throws(() => watchData({ ...base, variants: [variant, variant] }));
  assert.throws(() => watchData({ ...base, salePrice: 900000, saleStartsAt: '2026-01-02', saleEndsAt: '2026-01-01' }));
  assert.throws(() => watchData({ ...base, salePrice: 1000000, saleStartsAt: '2026-01-01', saleEndsAt: '2026-01-02' }));
});
