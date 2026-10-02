const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve(__dirname, '../services/api.ts');
const instance = new Module(filename);
instance.filename = filename;
instance._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, filename);
const { apiRequest, ApiError } = instance.exports;
function browser(t, token = 'old-session') {
  const previous = { window: global.window, localStorage: global.localStorage, fetch: global.fetch };
  const store = new Map(token ? [['ariwatch_token', token], ['ariwatch_user', 'old-user']] : []);
  const events = [];
  global.localStorage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => store.delete(key),
  };
  global.window = { dispatchEvent: event => events.push(event.type) };
  t.after(() => {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete global[name]; else global[name] = value;
    }
  });
  return { store, events };
}
const unauthorized = () => new Response(JSON.stringify({ error: 'Session expired' }), { status: 401 });
const expired = error => error instanceof ApiError && error.status === 401;
test('a delayed 401 for an old token preserves a newly signed-in session', async t => {
  const { store, events } = browser(t);
  let complete, sentHeaders;
  global.fetch = async (_url, options) => { sentHeaders = options.headers; return new Promise(resolve => { complete = resolve; }); };
  const pending = apiRequest('/api/auth/me', { authenticated: true });
  assert.equal(sentHeaders.Authorization, 'Bearer old-session');
  store.set('ariwatch_token', 'new-session'); store.set('ariwatch_user', 'new-user');
  complete(unauthorized());
  await assert.rejects(pending, expired);
  assert.equal(store.get('ariwatch_token'), 'new-session');
  assert.equal(store.get('ariwatch_user'), 'new-user');
  assert.deepEqual(events, []);
});
test('401 still clears the rejected current session and notifies listeners', async t => {
  const { store, events } = browser(t);
  global.fetch = async () => unauthorized();
  await assert.rejects(apiRequest('/api/auth/me', { authenticated: true }), expired);
  assert.equal(store.has('ariwatch_token'), false); assert.equal(store.has('ariwatch_user'), false);
  assert.deepEqual(events, ['ariwatch:auth']);
});
test('an anonymous delayed 401 cannot clear a session created while it was pending', async t => {
  const { store, events } = browser(t, null);
  let complete;
  global.fetch = async () => new Promise(resolve => { complete = resolve; });
  const pending = apiRequest('/api/auth/me', { authenticated: true });
  store.set('ariwatch_token', 'new-session'); store.set('ariwatch_user', 'new-user');
  complete(unauthorized()); await assert.rejects(pending, expired);
  assert.equal(store.get('ariwatch_token'), 'new-session'); assert.deepEqual(events, []);
});
test('explicit bearer requests invalidate only their matching current session', async t => {
  const { store, events } = browser(t);
  global.fetch = async () => unauthorized();
  await assert.rejects(apiRequest('/api/wishlist', { headers: { authorization: 'Bearer unrelated-session' } }), expired);
  assert.equal(store.get('ariwatch_token'), 'old-session'); assert.deepEqual(events, []);
  await assert.rejects(apiRequest('/api/wishlist', { headers: { authorization: 'Bearer old-session' } }), expired);
  assert.equal(store.has('ariwatch_token'), false); assert.deepEqual(events, ['ariwatch:auth']);
});
