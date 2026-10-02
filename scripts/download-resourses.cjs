const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const directory = path.resolve(__dirname, '../frontend/public/resourses');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function restore(asset) {
  if (path.basename(asset.filename) !== asset.filename) throw new Error('Invalid asset filename');
  const filename = path.join(directory, asset.filename);
  try {
    if (hash(await fs.readFile(filename)) === asset.sha256) {
      console.log(`Verified ${asset.filename}`);
      return;
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const response = await fetch(asset.sourceUrl, {
    headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
    throw new Error(`${asset.filename}: source unavailable (HTTP ${response.status})`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100 || bytes.length > 15 * 1024 * 1024 || hash(bytes) !== asset.sha256) {
    throw new Error(`${asset.filename}: source has changed; review the manifest before replacing it`);
  }
  await fs.writeFile(filename, bytes);
  console.log(`Restored ${asset.filename}`);
}
(async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, 'manifest.json'), 'utf8'));
  const pending = [...manifest.assets];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (pending.length) { const asset = pending.shift(); if (asset) await restore(asset); }
  }));
  console.log(`${manifest.assets.length} images ready in ${directory}`);
})().catch(error => { console.error(error.message); process.exitCode = 1; });
