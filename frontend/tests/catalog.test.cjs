const { test } = require('node:test'), assert = require('node:assert/strict');
const { readFileSync } = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const instance = new Module(filename); instance.filename = filename; cache.set(filename, instance);
  instance.require = id => id.startsWith('.') ? load(path.resolve(path.dirname(filename), id) + '.ts') : require(id);
  instance._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
  return instance.exports;
}
const cart = load(path.resolve(__dirname, '../services/catalog/cart.ts')), pricing = load(path.resolve(__dirname, '../services/catalog/pricing.ts'));
const collections = load(path.resolve(__dirname, '../services/catalog/collections.ts'));
const { initialVariantId } = load(path.resolve(__dirname, '../services/catalog/selection.ts'));
const id = '283d6d43-6a18-460f-b2d1-9180fbd9ee35', black = 'aebf4b34-3456-4bcb-a38a-849d267a0642', blue = '43fcc4f3-431a-422f-9a5d-33d681198c57';
const watch = { id, name: 'Test', description: 'Test watch', imageUrl: '/watch.svg', category: 'original', price: 1000000, stockQuantity: 20, salePrice: null, saleStartsAt: null, saleEndsAt: null,
  variants: [{ id: black, sku: 'BLACK', label: 'Black', price: 1000000, stockQuantity: 2 }, { id: blue, sku: 'BLUE', label: 'Blue', price: 1500000, stockQuantity: 3 }] };
test('variant cart identities stay separate and payment consumes only the purchased selection', () => {
  const first = cart.makeCartItem(watch, black, 2), second = cart.makeCartItem(watch, blue, 3);
  assert.notEqual(first.lineId, second.lineId); assert.equal(first.id, second.id);
  const remaining = cart.consumeCart([first, second], [{ watchId: id, variantId: black, quantity: 1 }]);
  assert.equal(remaining[0].quantity, 1); assert.equal(remaining[1].quantity, 3);
  assert.equal(cart.makeCartItem(watch), null);
  assert.equal(cart.makeCartItem({ ...watch, variants: [{ ...watch.variants[0], stockQuantity: 0 }] }, black), null);
});
test('saved carts ignore forged line IDs and retain different variants of one watch', () => {
  const first = cart.makeCartItem(watch, black), second = cart.makeCartItem(watch, blue);
  const parsed = cart.parseCart(JSON.stringify([{ ...first, lineId: 'forged' }, second, first]));
  assert.equal(parsed.length, 2); assert.equal(parsed[0].lineId, cart.cartLineId(id, black));
});
test('sale display restores regular price at the exact end boundary', () => {
  const offer = { ...watch, salePrice: 750000, saleStartsAt: '2026-10-02T10:00:00Z', saleEndsAt: '2026-10-02T11:00:00Z' };
  assert.equal(pricing.selectedPrice(offer, blue, Date.parse(offer.saleStartsAt)).price, 1125000);
  assert.equal(pricing.selectedPrice(offer, blue, Date.parse(offer.saleEndsAt)).price, 1500000);
});

test('variant deep links select the requested model even when it is out of stock', () => {
  const product = { ...watch, variants: [{ ...watch.variants[0], stockQuantity: 0 }, watch.variants[1]] };
  assert.equal(initialVariantId(product, black), black);
  assert.equal(initialVariantId(product, 'unknown'), blue);
  assert.equal(initialVariantId(product), blue);
});
test('guest collection storage validates IDs, deduplicates, and limits comparisons to four', () => {
  assert.deepEqual(collections.savedIds(JSON.stringify([id, id, 'bad'])), [id]);
  const values = [id, black, blue, '79176cba-79df-42ea-8aa2-28ff43fb9f21'];
  assert.deepEqual(collections.toggleId(values, 'new', 4), values);
  assert.equal(collections.toggleId(values, id, 4).length, 3);
});
