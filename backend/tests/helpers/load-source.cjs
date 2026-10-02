const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const cache = new Map();
module.exports = function loadSource(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const instance = new Module(filename);
  instance.filename = filename; cache.set(filename, instance);
  instance.require = id => id.startsWith('.') ? module.exports(path.resolve(path.dirname(filename), id) + '.ts') : require(id);
  instance._compile(compiled, filename);
  return instance.exports;
};
