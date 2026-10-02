const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { mkdtemp, rm, readdir } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const { zipSync, unzipSync, strToU8 } = require('fflate');
const { readSheet } = require('read-excel-file/node');
const writeExcelFile = require('write-excel-file/node').default;
const express = require('express');
const { applySchema } = require('./helpers/schema.cjs');
const { catalogTemplate, exportOrdersXlsx } = require('../dist/application/imports/workbooks');
const { safeArchive, imageExtension } = require('../dist/application/imports/safeArchive');
const { readCatalogRows, catalogHeaders } = require('../dist/application/imports/catalogRows');
const { CatalogImportService } = require('../dist/application/imports/CatalogImportService');
const { PostgresWatchRepository } = require('../dist/infrastructure/repositories/PostgresWatchRepository');
const catalog = client => new PostgresWatchRepository(client);
const { createBlogRoutes } = require('../dist/presentation/routes/blogRoutes');
const { createAdminBlogRoutes } = require('../dist/presentation/routes/adminBlogRoutes');
const { exportDateRange } = require('../dist/presentation/routes/orderExportRoutes');
const { errorHandler } = require('../dist/presentation/middleware');

async function setup(t) {
  const pg = new PGlite(); await applySchema(pg); t.after(() => pg.close());
  const adapter = executor => async (sql, params = []) => {
    if (sql.includes('pg_advisory_xact_lock')) return { rows:[],rowCount:1 };
    const result = await executor.query(sql,params); return { ...result,rowCount:result.affectedRows ?? result.rows.length };
  };
  const db = { query:adapter(pg),transaction:work => pg.transaction(tx => work({ query:adapter(tx) })) };
  const user = (await db.query("INSERT INTO users(mobile,role) VALUES('09990001111','staff_blog') RETURNING *")).rows[0];
  return { db,user,pg };
}

test('export validates real calendar dates and ordered creation-date ranges', () => {
  assert.deepEqual(exportDateRange({ from:'2024-02-29',to:'2024-03-01' }),['2024-02-29','2024-03-01']);
  assert.deepEqual(exportDateRange({}),[null,null]);
  for (const query of [{ from:'2026-02-30' },{ from:'2026-13-01' },{ from:'0000-01-01' },{ from:'2026-10-02',to:'2026-10-01' },{ from:['2026-10-02'] }])
    assert.throws(() => exportDateRange(query),error => error.status===400);
});

test('real XLSX template, canonical workbook parsing, every row error and literal order export', async () => {
  const template = await catalogTemplate();
  assert.equal(template.subarray(0,2).toString(),'PK');
  const sheet = await readSheet(template,'Products'); assert.equal(sheet[0][0],'sku'); assert.equal(sheet[1][3],2500000);
  const parsed = await readCatalogRows(template,[]); assert.deepEqual(parsed.errors,[]); assert.equal(parsed.rows[0].sku,'ARI-001');
  const bad = await writeExcelFile([catalogHeaders,['DUP','','',1.5,'bad',-1,'','missing.png','','','',''],['DUP','Name','Description',1000,'original',1,'','','https://example.test/watch.jpg','','','']],{ sheet:'Products' }).toBuffer();
  const badRows = await readCatalogRows(bad,[]); assert.ok(badRows.errors.filter(error => error.row===2).length>=6); assert.ok(badRows.errors.some(error => error.row===3&&error.field==='sku'));
  const formula = await writeExcelFile([catalogHeaders,[{ type:'Formula',value:'1+1' }]],{ sheet:'Products' }).toBuffer();
  await assert.rejects(() => readCatalogRows(formula,[]),/formulas/);
  const files = unzipSync(template); files['xl/worksheets/sheet1.xml'] = strToU8(Buffer.from(files['xl/worksheets/sheet1.xml']).toString().replace('<sheetData>','<sheetData><row r="999999"><c r="XFD999999"><v>1</v></c></row>'));
  await assert.rejects(() => readCatalogRows(Buffer.from(zipSync(files)),[]),/500 products/);
  const exportBuffer = await exportOrdersXlsx([{ id:randomUUID(),created_at:new Date(),status:'paid',currency:'IRT',total:2500000,
    customer:{ name:'=HYPERLINK("evil")',postalCode:'0123456789' },mobile:'09990001111',items:[] }]);
  const orders = await readSheet(exportBuffer,'Orders'); assert.equal(orders[1][12],'=HYPERLINK("evil")'); assert.equal(orders[1][16],'0123456789');
  assert.ok(!Buffer.from(unzipSync(exportBuffer)['xl/worksheets/sheet1.xml']).toString().includes('<f>'));
});

test('ZIP rejects traversal, scripts, duplicates, compression bombs and mismatched image types', () => {
  assert.throws(() => safeArchive(Buffer.from('bad'),'images'),/valid ZIP/);
  assert.throws(() => safeArchive(Buffer.from(zipSync({ '../a.png':strToU8('x') })),'images'),/path/);
  assert.throws(() => safeArchive(Buffer.from(zipSync({ 'a.svg':strToU8('<svg/>') })),'images'),/PNG/);
  assert.throws(() => safeArchive(Buffer.from(zipSync({ 'a.png':new Uint8Array(6*1024*1024) })),'images'),/large/);
  const forged = Buffer.from(zipSync({ 'a.png':new Uint8Array(6*1024*1024) })); forged.writeUInt32LE(1,22);
  assert.throws(() => safeArchive(forged,'images'),error => error.status===400);
  assert.throws(() => safeArchive(Buffer.from(zipSync({ 'a.png':strToU8('x'),'A.PNG':strToU8('x') })),'images'),/duplicate/);
  assert.throws(() => imageExtension('a.png',Buffer.from('<script>')),/extension/);
});

test('image previews do not write media; failed confirmation rolls back database and removes files', async t => {
  const { db,user } = await setup(t), directory = await mkdtemp(join(tmpdir(),'ariwatch-image-'));
  t.after(() => rm(directory,{ recursive:true,force:true }));
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7x8AAAAASUVORK5CYII=','base64');
  const images = Buffer.from(zipSync({ 'IMG-001.png':png }));
  const workbook = await writeExcelFile([catalogHeaders,['IMG-001','Image watch','Image import test',2500000,'original',1,'','IMG-001.png','','','','']],{ sheet:'Products' }).toBuffer();
  const badDb = { ...db,transaction:work => db.transaction(client => work({ query:(sql,params) => {
    if (sql.startsWith('INSERT INTO watches')) throw new Error('Simulated failure'); return client.query(sql,params);
  } })) };
  const service = new CatalogImportService(badDb,catalog,directory,'https://api.example.test/media/catalog');
  const preview = await service.preview(user.id,workbook,images); assert.equal(preview.canConfirm,true);
  assert.equal((await readdir(directory)).length,0);
  await assert.rejects(() => service.confirm(user.id,preview.id),/Simulated failure/);
  assert.equal((await readdir(directory)).length,0); assert.equal((await db.query('SELECT id FROM watches')).rows.length,0);
  assert.equal((await new CatalogImportService(db,catalog,directory,'https://api.example.test/media/catalog').confirm(user.id,preview.id)).created,1);
  assert.equal((await readdir(directory)).length,1);
  assert.match((await db.query('SELECT image_url FROM watches')).rows[0].image_url,/^https:\/\/api\.example\.test\/media\/catalog\/[0-9a-f-]+\.png$/);
});

test('bulk preview is read only, confirm is transactional and repeatable, stable SKU preserves product ID', async t => {
  const { db,user } = await setup(t), directory = await mkdtemp(join(tmpdir(),'ariwatch-import-'));
  t.after(() => rm(directory,{ recursive:true,force:true }));
  const service = new CatalogImportService(db,catalog,directory,'https://api.example.test/media/catalog');
  const first = await service.preview(user.id,await catalogTemplate()); assert.equal(first.canConfirm,true);
  assert.equal((await db.query('SELECT id FROM watches')).rows.length,0);
  const result = await service.confirm(user.id,first.id); assert.deepEqual(result,{ imported:1,created:1,updated:0 });
  assert.deepEqual(await service.confirm(user.id,first.id),result);
  const product = (await db.query('SELECT * FROM watches')).rows[0]; assert.equal(product.sku,'ARI-001'); assert.match(product.meta_title,/Ariwatch/);
  const second = await service.preview(user.id,await catalogTemplate()); assert.equal(second.updateCount,1);
  assert.equal((await service.confirm(user.id,second.id)).updated,1);
  assert.equal((await db.query('SELECT * FROM watches')).rows[0].id,product.id);
  assert.equal((await readdir(directory)).length,0);
  await assert.rejects(() => service.confirm(randomUUID(),second.id),/not found/);
  const expired = await service.preview(user.id,await catalogTemplate()); await db.query("UPDATE catalog_imports SET expires_at=NOW()-INTERVAL '1 minute' WHERE id=$1",[expired.id]);
  await assert.rejects(() => service.confirm(user.id,expired.id),/expired/);
});

test('blog drafts are private, product blocks validated, signed-in comments are moderated with scoped roles', async t => {
  const { db,user } = await setup(t);
  const watchId = (await db.query("INSERT INTO watches(name,description,price,image_url) VALUES('Watch','Safe',2500000,'https://example.test/w.jpg') RETURNING id")).rows[0].id;
  const auth = { authenticate:async token => ({ ...user,role:token === 'blog' ? 'staff_blog' : 'user' }) };
  const app = express(); app.use(express.json()); app.use('/api/blog',createBlogRoutes(auth,db)); app.use('/api/admin/blog',createAdminBlogRoutes(auth,db)); app.use(errorHandler);
  const server = app.listen(0,'127.0.0.1'); await new Promise(resolve => server.once('listening',resolve)); t.after(() => new Promise(resolve => server.close(resolve)));
  const api = async (path,method='GET',body,token) => { const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`,{ method,
    headers:{ 'Content-Type':'application/json',...(token ? { Authorization:`Bearer ${token}` } : {}) },body:body && JSON.stringify(body) }); return { status:response.status,data:await response.json().catch(() => null) }; };
  const input = { lang:'fa',title:'راهنمای ساعت',slug:'راهنمای-ساعت',excerpt:'راهنمای انتخاب ساعت',status:'draft',blocks:[{ type:'text',text:'<script>alert(1)</script>' },{ type:'product',watchId }] };
  assert.equal((await api('/api/admin/blog','POST',input,'user')).status,403);
  const draft = await api('/api/admin/blog','POST',input,'blog'); assert.equal(draft.status,201);
  const path = '/api/blog/'+encodeURIComponent(input.slug)+'?lang=fa'; assert.equal((await api(path)).status,404);
  assert.equal((await api('/api/admin/blog/'+draft.data.id,'PUT',{ ...input,status:'published' },'blog')).status,200);
  assert.equal((await api(path)).data.blocks[1].watchId,watchId);
  assert.equal((await api('/api/blog/'+draft.data.id+'/comments','POST',{ name:'Reader',body:'A useful article' })).status,401);
  const comment = await api('/api/blog/'+draft.data.id+'/comments','POST',{ name:'Reader',body:'A useful article' },'user'); assert.equal(comment.data.status,'pending');
  const commentsPath = '/api/blog/'+encodeURIComponent(input.slug)+'/comments?lang=fa'; assert.deepEqual((await api(commentsPath)).data,[]);
  assert.equal((await api('/api/admin/blog/comments/'+comment.data.id,'PATCH',{ status:'approved' },'user')).status,403);
  assert.equal((await api('/api/admin/blog/comments/'+comment.data.id,'PATCH',{ status:'approved' },'blog')).status,200);
  assert.equal((await api(commentsPath)).data.length,1);
  assert.equal((await api('/api/admin/blog','POST',{ ...input,slug:'bad',blocks:[{ type:'html',text:'x' }] },'blog')).status,400);
});
