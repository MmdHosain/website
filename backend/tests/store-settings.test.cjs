const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes, createHash } = require('node:crypto');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');
const { createApp } = require('../dist/presentation/app');

test('hero settings use real sessions, scoped permissions, fresh public reads and atomic partial saves', async t => {
  const pg = new PGlite();
  let server;
  t.after(async () => { if (server) await new Promise(resolve => server.close(resolve)); await pg.close(); });
  await applySchema(pg);
  const adapter = executor => async (sql,params = []) => {
    const result = await executor.query(sql,params);
    return { ...result,rowCount:result.affectedRows ?? result.rows.length };
  };
  const db = { query:adapter(pg),transaction:work => pg.transaction(tx => work({ query:adapter(tx) })) };
  const tokens = {};
  for (const [index,role] of ['admin','user','staff_orders','staff_catalog','staff_blog'].entries()) {
    const user = (await pg.query('INSERT INTO users(mobile,role) VALUES($1,$2) RETURNING id',[`0912777000${index}`,role])).rows[0];
    const token = randomBytes(32).toString('base64url');
    tokens[role] = token;
    await pg.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL \'1 day\')',
      [createHash('sha256').update(token).digest('hex'),user.id]);
  }
  server = createApp({ db }).listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const api = async (path,{ role,method = 'GET',body,raw } = {}) => {
    const response = await fetch(origin+path,{ method,headers:{ ...(role ? { Authorization:`Bearer ${tokens[role]}` } : {}),
      ...(body !== undefined || raw !== undefined ? { 'Content-Type':'application/json' } : {}) },
      body:raw ?? (body !== undefined ? JSON.stringify(body) : undefined) });
    return { status:response.status,data:await response.json(),cache:response.headers.get('Cache-Control') };
  };
  const adminSave = body => api('/api/admin/settings',{ role:'admin',method:'PUT',body });
  const publicDefault = await api('/api/storefront/settings');
  assert.equal(publicDefault.status,200);
  assert.equal(publicDefault.cache,'no-store');
  assert.deepEqual(publicDefault.data,{ heroStyle:'watch-photos' },'public settings expose only the hero choice');
  assert.equal((await api('/api/admin/settings')).status,401);
  assert.equal((await api('/api/admin/settings',{ method:'PUT',body:{ heroStyle:'classic-clock' } })).status,401);
  for (const role of ['user','staff_orders','staff_catalog','staff_blog']) {
    assert.equal((await api('/api/admin/settings',{ role })).status,403);
    assert.equal((await api('/api/admin/settings',{ role,method:'PUT',body:{ heroStyle:'classic-clock' } })).status,403);
  }
  assert.deepEqual((await api('/api/admin/settings',{ role:'admin' })).data,{ shippingCost:0,heroStyle:'watch-photos' });
  assert.deepEqual((await adminSave({ shippingCost:75000 })).data,{ shippingCost:75000,heroStyle:'watch-photos' });
  assert.deepEqual((await adminSave({ heroStyle:'classic-clock' })).data,{ shippingCost:75000,heroStyle:'classic-clock' });
  assert.deepEqual((await api('/api/storefront/settings')).data,{ heroStyle:'classic-clock' },'public reads reflect the persisted update');
  assert.deepEqual((await api('/api/shipping')).data,{ shippingCost:75000 });
  assert.deepEqual((await adminSave({ shippingCost:0 })).data,{ shippingCost:0,heroStyle:'classic-clock' });
  const concurrent = await Promise.all([adminSave({ shippingCost:180000 }),adminSave({ heroStyle:'watch-photos' })]);
  assert.ok(concurrent.every(response => response.status === 200));
  const persisted = { shippingCost:180000,heroStyle:'watch-photos' };
  assert.deepEqual((await api('/api/admin/settings',{ role:'admin' })).data,persisted,'concurrent independent saves preserve both values');
  for (const body of [{},[],null,'classic-clock',{ heroStyle:'unsupported' },{ heroStyle:null },{ heroStyle:1 },
    { heroStyle:' classic-clock ' },{ shippingCost:-1 },{ shippingCost:0.5 },{ shippingCost:'100' },{ shippingCost:null },
    { shippingCost:100000001 },{ heroStyle:'classic-clock',unknown:true },{ heroStyle:{ value:'classic-clock' } }]) {
    const response = await adminSave(body);
    assert.equal(response.status,400,JSON.stringify(body));
    assert.equal(typeof response.data.error,'string');
  }
  assert.equal((await api('/api/admin/settings',{ role:'admin',method:'PUT' })).status,400);
  assert.equal((await api('/api/admin/settings',{ role:'admin',method:'PUT',raw:'{"heroStyle":' })).status,400);
  assert.deepEqual((await api('/api/admin/settings',{ role:'admin' })).data,persisted,'invalid requests never partially update settings');
  assert.deepEqual((await adminSave({ shippingCost:90000,heroStyle:'classic-clock' })).data,{ shippingCost:90000,heroStyle:'classic-clock' });
});

test('hero migration supplies the photo default and preserves existing shipping and selected style on restart', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  const directory = join(__dirname,'../src/infrastructure/database');
  const schema = await readFile(join(directory,'schema.sql'),'utf8');
  const commerce = await readFile(join(directory,'features/02-commerce.sql'),'utf8');
  const migration = await readFile(join(directory,'features/06-storefront-settings.sql'),'utf8');
  await pg.exec(schema);
  await pg.exec(commerce);
  await pg.query('UPDATE store_settings SET shipping_cost=123000');
  await pg.exec(migration);
  assert.deepEqual((await pg.query('SELECT shipping_cost,hero_style FROM store_settings')).rows[0],{ shipping_cost:'123000',hero_style:'watch-photos' });
  await pg.query("UPDATE store_settings SET shipping_cost=654000,hero_style='classic-clock'");
  await pg.exec(commerce);
  await pg.exec(migration);
  await pg.exec(migration);
  assert.deepEqual((await pg.query('SELECT shipping_cost,hero_style FROM store_settings')).rows[0],{ shipping_cost:'654000',hero_style:'classic-clock' });
  await assert.rejects(pg.query("UPDATE store_settings SET hero_style='invalid'"),error => error.code === '23514');
});
