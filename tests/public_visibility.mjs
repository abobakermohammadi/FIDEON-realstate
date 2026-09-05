import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/app.js', import.meta.url), 'utf8');
const storage = new Map();
const document = {
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({}),
  head: { appendChild: () => {} },
  body: { classList: { contains: () => false }, appendChild: () => {} }
};

const context = {
  console,
  document,
  localStorage: {
    getItem: key => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  },
  setTimeout,
  clearTimeout,
  URLSearchParams,
  encodeURIComponent,
  location: { search: '', origin: 'http://localhost:4173' }
};
context.window = context;
context.FIDEON = {
  config: { whatsapp: '905013575635', phone: '+90 501 357 56 35' },
  sampleProperties: [{ id: 'seed', slug: 'seed', visibility: 'Public', status: 'Satılık' }],
  seedLeads: []
};

vm.createContext(context);
vm.runInContext(source, context, { filename: 'assets/app.js' });

const { isPublicProperty, getProperties } = context.FIDEON.store;
assert.equal(isPublicProperty({ visibility: 'Public', status: 'Satılık' }), true);
assert.equal(isPublicProperty({ visibility: 'Teaser', status: 'Satılık' }), true);
assert.equal(isPublicProperty({ visibility: 'Private', status: 'Satılık' }), false);
assert.equal(isPublicProperty({ visibility: 'Hidden', status: 'Satılık' }), false);
assert.equal(isPublicProperty({ visibility: 'Public', status: 'Taslak' }), false);
assert.equal(isPublicProperty({ visibility: 'Public', status: 'Arşiv' }), false);
assert.equal(isPublicProperty({ visibility: 'Public', status: 'Satıldı' }), true);

storage.set('fideon.properties.v2', '[]');
assert.deepEqual(Array.from(getProperties()), [], 'explicit empty inventory must stay empty');

storage.delete('fideon.properties.v2');
assert.equal(getProperties().length, 1, 'seed inventory is used only when no local inventory exists');

console.log('PASS: public listing visibility and empty-inventory rules');
