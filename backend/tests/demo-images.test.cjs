const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { randomUUID } = require('node:crypto');
const { PGlite } = require('@electric-sql/pglite');
const { applySchema } = require('./helpers/schema.cjs');

test('local demo images preserve edited catalogs, saved orders, customers and deleted products', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  await applySchema(pg);
  const directory = join(__dirname,'../src/infrastructure/database');
  const seed = await readFile(join(directory,'init.sql'),'utf8');
  const migration = await readFile(join(directory,'features/05-local-demo-images.sql'),'utf8');
  await pg.exec(seed);
  const watches = (await pg.query('SELECT * FROM watches ORDER BY name')).rows;
  assert.equal(watches.length,60);
  assert.ok(watches.every(watch => /^\/resourses\/(?:photo-[\w-]+|lifestyle-watch-[123])\.jpg$/.test(watch.image_url)));
  assert.equal(new Set(watches.map(watch => watch.image_url)).size,10);
  const byName = name => watches.find(watch => watch.name === name);
  assert.equal(byName('A. Lange & Söhne Lange 1').image_url,'/resourses/lifestyle-watch-1.jpg');
  assert.equal(byName('Cartier Tank Must').image_url,'/resourses/lifestyle-watch-2.jpg');
  assert.equal(byName('Patek Philippe Nautilus 5711').image_url,'/resourses/lifestyle-watch-3.jpg');

  // An existing catalog from before this asset migration may contain administrator edits.
  await pg.query("DELETE FROM schema_migrations WHERE name='local_demo_images_v1'");
  const matching = byName('Rolex Daytona Cosmograph');
  const customImage = byName('Patek Philippe Nautilus 5711');
  const renamed = byName('Omega Speedmaster Moonwatch');
  const differentOriginal = byName('Audemars Piguet Royal Oak');
  const deleted = byName('Cartier Santos de Cartier');
  const fallbacks = [byName('A. Lange & Söhne Lange 1'),byName('Cartier Tank Must'),byName('TAG Heuer Monaco')];
  const fallbackPhotos = ['photo-1508656937041-edbe9e178f8f','photo-1587836374828-cb4387df3eb7','photo-1548036328-c9fa89d128fa'];
  const oldUrl = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800';
  await pg.query(`UPDATE watches SET image_url=$2,price=7654321,description='Administrator description',
    stock_quantity=7,features='Administrator features',sku='LOCAL-KEEP' WHERE id=$1`, [matching.id,oldUrl]);
  await pg.query('UPDATE watches SET image_url=$2 WHERE id=$1', [customImage.id,'https://shop.example/custom.jpg']);
  await pg.query('UPDATE watches SET name=$2,image_url=$3 WHERE id=$1', [renamed.id,'Personal watch',oldUrl]);
  await pg.query('UPDATE watches SET image_url=$2 WHERE id=$1', [differentOriginal.id,oldUrl]);
  for (const [index,watch] of fallbacks.entries()) await pg.query('UPDATE watches SET image_url=$2 WHERE id=$1',
    [watch.id,`https://images.unsplash.com/${fallbackPhotos[index]}?auto=format&fit=crop&q=80&w=800`]);
  await pg.query('DELETE FROM watches WHERE id=$1',[deleted.id]);
  await pg.query(`INSERT INTO watch_variants(watch_id,sku,label,price,stock_quantity)
    VALUES($1,'LOCAL-KEEP-BLUE','Blue',8765432,2)`, [matching.id]);
  const customer = (await pg.query("INSERT INTO users(mobile) VALUES('09129996666') RETURNING *")).rows[0];
  await pg.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,NOW()+INTERVAL \'1 day\')', ['a'.repeat(64),customer.id]);
  await pg.query(`INSERT INTO orders(user_id,idempotency_key,request_hash,items,customer,total)
    VALUES($1,$2,$3,$4::jsonb,$5::jsonb,7654321)`, [customer.id,randomUUID(),'b'.repeat(64),
    JSON.stringify([{ watchId:matching.id,name:matching.name,price:7654321,imageUrl:oldUrl,quantity:1 }]),
    JSON.stringify({ name:'Saved Customer',address:'Saved Address',city:'Tehran',postalCode:'1234567890' })]);
  const before = (await pg.query('SELECT * FROM watches WHERE id=$1',[matching.id])).rows[0];
  const savedOrders = (await pg.query('SELECT * FROM orders')).rows;
  const savedSessions = (await pg.query('SELECT * FROM sessions')).rows;
  const savedVariants = (await pg.query('SELECT * FROM watch_variants')).rows;

  await pg.exec(migration);
  const after = (await pg.query('SELECT * FROM watches WHERE id=$1',[matching.id])).rows[0];
  assert.equal(after.image_url,'/resourses/photo-1547996160-81dfa63595aa.jpg');
  assert.deepEqual({ ...after,image_url:before.image_url,updated_at:before.updated_at },before,'only image content and its audit timestamp change');
  assert.ok(after.updated_at >= before.updated_at);
  for (const [index,watch] of fallbacks.entries()) assert.equal(
    (await pg.query('SELECT image_url FROM watches WHERE id=$1',[watch.id])).rows[0].image_url,`/resourses/lifestyle-watch-${index+1}.jpg`);
  assert.equal((await pg.query('SELECT image_url FROM watches WHERE id=$1',[customImage.id])).rows[0].image_url,'https://shop.example/custom.jpg');
  assert.equal((await pg.query('SELECT image_url FROM watches WHERE id=$1',[renamed.id])).rows[0].image_url,oldUrl,'renamed products are excluded');
  assert.equal((await pg.query('SELECT image_url FROM watches WHERE id=$1',[differentOriginal.id])).rows[0].image_url,oldUrl,'a known name with a different photo is excluded');
  assert.deepEqual((await pg.query('SELECT * FROM orders')).rows,savedOrders,'historical image/customer snapshots remain intact');
  assert.deepEqual((await pg.query('SELECT * FROM sessions')).rows,savedSessions);
  assert.deepEqual((await pg.query('SELECT * FROM watch_variants')).rows,savedVariants);
  assert.deepEqual((await pg.query('SELECT * FROM users WHERE id=$1',[customer.id])).rows[0],customer);

  // Once completed, a later administrator choice is preserved across subsequent startups.
  await pg.query('UPDATE watches SET image_url=$2 WHERE id=$1',[matching.id,oldUrl]);
  await pg.exec(migration);
  await pg.exec(seed);
  assert.equal((await pg.query('SELECT image_url FROM watches WHERE id=$1',[matching.id])).rows[0].image_url,oldUrl);
  assert.equal((await pg.query('SELECT id FROM watches WHERE id=$1',[deleted.id])).rows.length,0);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM watches')).rows[0].count,59);
  assert.equal((await pg.query("SELECT count(*)::int AS count FROM schema_migrations WHERE name='local_demo_images_v1'")).rows[0].count,1);
});
