const test = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');
const { PGlite } = require('@electric-sql/pglite');

test('startup migrations preserve edited and deleted watches and only update unchanged legacy demo prices', async t => {
  const pg = new PGlite();
  t.after(() => pg.close());
  const schema = await readFile(join(__dirname, '../src/infrastructure/database/schema.sql'), 'utf8');
  const seed = await readFile(join(__dirname, '../src/infrastructure/database/init.sql'), 'utf8');
  await pg.exec(schema);
  await pg.exec(seed);
  const rows = (await pg.query('SELECT * FROM watches ORDER BY name')).rows;
  assert.equal(rows.length, 60);
  assert.ok(rows.every(row => Number(row.price) >= 1000000));
  await pg.query('UPDATE watches SET price=4444444,name=$2 WHERE id=$1', [rows[0].id, 'Edited by administrator']);
  await pg.query('DELETE FROM watches WHERE id=$1', [rows[1].id]);
  await pg.exec(schema);
  await pg.exec(seed);
  assert.equal((await pg.query('SELECT count(*)::int AS count FROM watches')).rows[0].count, 59);
  assert.equal(Number((await pg.query('SELECT price FROM watches WHERE id=$1', [rows[0].id])).rows[0].price), 4444444);
  assert.equal((await pg.query('SELECT id FROM watches WHERE id=$1', [rows[1].id])).rows.length, 0);

  // Simulate a previous version's catalog with one unchanged demo price and one administrator price.
  await pg.exec("DELETE FROM watches; DELETE FROM schema_migrations WHERE name='demo_toman_prices_v1';");
  await pg.query(`INSERT INTO watches(name,description,price,image_url,category) VALUES
    ('Rolex Daytona Cosmograph','Legacy demo',35000,'https://example.test/1','original'),
    ('Omega Speedmaster Moonwatch','Edited price',6501,'https://example.test/2','original')`);
  await pg.exec(seed);
  const legacy = (await pg.query('SELECT name,price FROM watches')).rows;
  assert.equal(legacy.length, 2, 'existing catalogs are not supplemented with demo products');
  assert.ok(Number(legacy.find(row => row.name === 'Rolex Daytona Cosmograph').price) > 1000000);
  assert.equal(Number(legacy.find(row => row.name === 'Omega Speedmaster Moonwatch').price), 6501);
});
