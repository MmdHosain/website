const fs = require('node:fs');
const path = require('node:path');
for (const filename of ['schema.sql', 'init.sql']) {
  fs.copyFileSync(path.join(__dirname, '..', 'src', 'infrastructure', 'database', filename), path.join(__dirname, '..', 'dist', 'infrastructure', 'database', filename));
}
fs.cpSync(path.join(__dirname, '..', 'src', 'infrastructure', 'database', 'features'), path.join(__dirname, '..', 'dist', 'infrastructure', 'database', 'features'), { recursive: true });
