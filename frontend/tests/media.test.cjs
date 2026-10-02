const { test } = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const filename = path.resolve(__dirname, '../services/media.ts');
const instance = new Module(filename);
instance._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { localMediaUrl } = instance.exports;

test('historical demo URLs use local files regardless of their image transformations', () => {
  const prefix = 'https://images.unsplash.com/photo-1524592094714-0f0654e20314';
  const expected = '/resourses/photo-1524592094714-0f0654e20314.jpg';
  assert.equal(localMediaUrl(prefix + '?w=800&fit=crop'), expected);
  assert.equal(localMediaUrl(prefix + '?auto=format&w=1400'), expected);
  assert.ok(fs.existsSync(path.resolve(__dirname, '../public' + expected)));
});

test('unavailable or unrelated original demo photos receive watch replacements', () => {
  assert.equal(localMediaUrl('https://images.unsplash.com/photo-1508656937041-edbe9e178f8f'), '/resourses/lifestyle-watch-1.jpg');
  assert.equal(localMediaUrl('https://images.unsplash.com/photo-1587836374828-cb4387df3eb7?w=500'), '/resourses/lifestyle-watch-2.jpg');
  assert.equal(localMediaUrl('https://images.unsplash.com/photo-1548036328-c9fa89d128fa'), '/resourses/lifestyle-watch-3.jpg');
});

test('custom uploads, unrelated remote images and local paths retain their original URL', () => {
  for (const source of ['/resourses/hero-santos.png', '/uploads/custom-watch.jpg', 'placeholder',
    'https://images.unsplash.com/photo-custom?w=900',
    'https://example.com/photo-1524592094714-0f0654e20314',
    'https://images.unsplash.com.example.com/photo-1524592094714-0f0654e20314']) {
    assert.equal(localMediaUrl(source), source);
  }
});
