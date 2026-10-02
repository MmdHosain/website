const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');
const { createApp } = require('../dist/presentation/app');
const { salesReport } = require('../dist/application/commerce/sales');

test('staff scopes deny settings and role management while paid-date reports aggregate the full selected period', async t => {
  const pg = new PGlite(); await applySchema(pg);
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await executor.query(sql, params); return { ...result, rowCount: result.affectedRows ?? result.rows.length };
  };
  const db = { query: adapter(pg), transaction: work => pg.transaction(tx => work({ query: adapter(tx) })) };
  const admin = (await pg.query("INSERT INTO users(mobile,role) VALUES('09120000001','admin') RETURNING *")).rows[0];
  const staff = (await pg.query("INSERT INTO users(mobile,role) VALUES('09120000002','staff_orders') RETURNING *")).rows[0];
  const catalog = (await pg.query("INSERT INTO users(mobile,role) VALUES('09120000003','staff_catalog') RETURNING *")).rows[0];
  const users = { admin, staff, catalog };
  const auth = { authenticate: async token => { if (!users[token]) throw Object.assign(new Error('Sign in'), { status: 401 }); return users[token]; } };
  const server = createApp({ db,auth }).listen(0,'127.0.0.1');
  await new Promise(resolve => server.once('listening',resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await pg.close(); });
  const url = `http://127.0.0.1:${server.address().port}`;
  const api = async (path,token,body) => {
    const response = await fetch(url+path,{ method: body ? 'PATCH' : 'GET',headers:{ Authorization:`Bearer ${token}`,...(body ? {'Content-Type':'application/json'} : {}) },body:body ? JSON.stringify(body) : undefined });
    return { status:response.status,data:await response.json() };
  };
  assert.equal((await api('/api/admin/settings','staff')).status,403);
  assert.equal((await api('/api/admin/discounts','staff')).status,403);
  assert.equal((await api('/api/admin/users','staff')).status,403);
  assert.equal((await api(`/api/admin/users/${catalog.id}/role`,'staff',{role:'admin'})).status,403);
  assert.equal((await api('/api/admin/orders','catalog')).status,403);
  assert.equal((await api('/api/admin/orders','staff')).status,200);
  assert.equal((await api('/api/admin/settings','admin')).status,200);
  assert.equal((await api(`/api/admin/users/${admin.id}/role`,'admin',{role:'user'})).status,409);
  assert.equal((await api(`/api/admin/users/${catalog.id}/role`,'admin',{role:'staff_blog'})).data.role,'staff_blog');
  for (const [paidAt,total,category] of [['2026-10-01T12:00:00Z',1000000,'original'],['2026-10-02T12:00:00Z',2000000,'highcopy']]) {
    await pg.query(`INSERT INTO orders(user_id,idempotency_key,request_hash,items,customer,total,subtotal,currency,status,paid_at)
      VALUES($1,$2,$3,$4::jsonb,'{}', $5,$5,'IRT','paid',$6)`,[staff.id,randomUUID(),'a'.repeat(64),JSON.stringify([{watchId:randomUUID(),name:category,price:total,quantity:1,category}]),total,paidAt]);
  }
  const all = await salesReport(db,undefined,undefined);
  assert.equal(all.summary.orderCount,2);
  assert.equal(all.summary.revenue,3000000);
  const selected = await salesReport(db,'2026-10-02','2026-10-02');
  assert.equal(selected.summary.orderCount,1);
  assert.equal(selected.summary.revenue,2000000);
  assert.equal(selected.products[0].type,'highcopy');
  await assert.rejects(salesReport(db,'2026-02-30',undefined),error=>error.status===400);
  await assert.rejects(salesReport(db,'2026-10-03','2026-10-02'),error=>error.status===400);
});
