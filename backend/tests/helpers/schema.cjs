const { readFile, readdir } = require('node:fs/promises');
const { join } = require('node:path');
exports.applySchema = async pg => {
  const directory = join(__dirname, '../../src/infrastructure/database');
  await pg.exec(await readFile(join(directory, 'schema.sql'), 'utf8'));
  for (const file of (await readdir(join(directory, 'features'))).filter(f => f.endsWith('.sql')).sort()) {
    await pg.exec(await readFile(join(directory, 'features', file), 'utf8'));
  }
};
