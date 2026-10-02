const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ZarinpalGateway, createPaymentGateway } = require('../dist/infrastructure/payments/ZarinpalGateway');
const merchant = '00000000-0000-0000-0000-000000000000';
const authority = 'S' + '0'.repeat(35);
test('gateway charges and verifies the same rial amount from a toman total', async () => {
  const calls = [];
  const gateway = new ZarinpalGateway(merchant, true, async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return Response.json({ data: url.includes('/request.') ? { code: 100, authority } : { code: 100, ref_id: 123456 }, errors: [] });
  });
  const result = await gateway.requestPayment({ orderId: 'order-1', amount: 2500000, description: 'Watch', callbackUrl: 'http://localhost:4000/callback' });
  assert.equal(result.paymentUrl, 'https://sandbox.zarinpal.com/pg/StartPay/' + authority);
  assert.equal(calls[0].body.amount, 25000000);
  assert.equal(calls[0].body.currency, 'IRR');
  assert.equal(calls[0].body.metadata.order_id, 'order-1');
  assert.equal((await gateway.verifyPayment({ authority, amount: 2500000 })).refId, '123456');
  assert.equal(calls[1].body.amount, calls[0].body.amount);
});
test('already verified code 101 is idempotent success', async () => {
  const gateway = new ZarinpalGateway(merchant, true, async () => Response.json({ data: { code: 101, ref_id: '123' } }));
  assert.equal((await gateway.verifyPayment({ authority, amount: 1000 })).refId, '123');
});
test('gateway failures never produce a receipt and retain provider error codes', async () => {
  const gateway = new ZarinpalGateway(merchant, true, async () => Response.json({ data: {}, errors: { code: -51 } }, { status: 400 }));
  await assert.rejects(gateway.verifyPayment({ authority, amount: 1000 }), error => error.providerCode === -51);
  const network = new ZarinpalGateway(merchant, true, async () => { throw new Error('offline'); });
  await assert.rejects(network.verifyPayment({ authority, amount: 1000 }), error => error.status === 502 && !error.providerCode);
});
test('invalid totals and malicious authority are rejected before provider calls', async () => {
  let calls = 0;
  const gateway = new ZarinpalGateway(merchant, true, async () => { calls++; return Response.json({}); });
  for (const amount of [-1, 100.1, 999, 100000001, NaN]) await assert.rejects(gateway.verifyPayment({ authority, amount }));
  await assert.rejects(gateway.verifyPayment({ authority: '../malicious', amount: 1000 }));
  assert.equal(calls, 0);
});
test('live gateway requires a merchant and HTTPS callback', async () => {
  assert.throws(() => new ZarinpalGateway('', false), error => error.status === 503);
  const gateway = new ZarinpalGateway(merchant, false, async () => Response.json({}));
  await assert.rejects(gateway.requestPayment({ orderId: 'x', amount: 1000, description: 'x', callbackUrl: 'http://shop.test/callback' }), error => error.status === 503);
});
test('inquiry distinguishes active and failed attempts without manufacturing a receipt', async () => {
  for (const status of ['VERIFIED', 'PAID', 'IN_BANK', 'FAILED', 'REVERSED']) {
    const gateway = new ZarinpalGateway(merchant, true, async (url, options) => {
      assert.ok(url.endsWith('/inquiry.json'));
      assert.equal(JSON.parse(options.body).authority, authority);
      return Response.json({ data: { code: 100, status } });
    });
    assert.deepEqual(await gateway.inquirePayment({ authority }), { status });
  }
  const invalid = new ZarinpalGateway(merchant, true, async () => Response.json({ errors: { authority: ['Invalid authority.', '-54'] } }, { status: 400 }));
  await assert.rejects(invalid.inquirePayment({ authority }), error => error.providerCode === -54);
});
