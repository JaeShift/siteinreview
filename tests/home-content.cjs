const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Compile only the pure selectors; fixtures never touch the live inventory.
const filename = path.resolve(__dirname, '../lib/home-content.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const selectorModule = new Module(filename, module);
selectorModule._compile(compiled, filename);
const { selectFeaturedProducts, selectUpcomingEvents } = selectorModule.exports;
const card = (id, overrides = {}) => ({ id, name: id, imageUrl: '/card.png', price: 5, quantity: 1, ...overrides });
const event = (slug, overrides = {}) => ({ slug, title: slug, date: '2026-09-25', time: '2:00 PM', endTime: '10:00 PM', format: 'Commander', ...overrides });
const now = new Date('2026-09-21T19:00:00Z');

test('empty and short inventories return only real available products', () => {
  assert.deepEqual(selectFeaturedProducts([]), []);
  const one = card('one');
  assert.deepEqual(selectFeaturedProducts([one]), [one]);
});
test('featured products reverse order, deduplicate names and retain exact records', () => {
  const cards = ['one', 'two', 'three', 'four', 'five'].map(id => card(id));
  const variant = card('variant-id', { name: ' FIVE ', foil: true, price: 7.25 });
  const input = [...cards, variant];
  assert.deepEqual(selectFeaturedProducts(input), [variant, cards[3], cards[2], cards[1]]);
  assert.equal(input[0], cards[0]);
});
test('hidden, presale, unavailable and invalid products are excluded', () => {
  const invalid = [{ hidden: true }, { availability: 'Presale' }, { quantity: 0 }, { quantity: -1 },
    { quantity: 1.5 }, { quantity: NaN }, { price: NaN }, { price: Infinity }, { price: 0 },
    { price: -1 }, { id: '' }, { name: ' ' }, { imageUrl: '' }];
  assert.deepEqual(selectFeaturedProducts(invalid.map((patch, i) => card(String(i), patch))), []);
});
test('authoritative prerelease replaces local records; hidden authority never leaks', () => {
  const local = event('stale', { format: 'Prerelease' });
  const authoritative = event('real', { format: 'Prerelease' });
  assert.deepEqual(selectUpcomingEvents([local], authoritative, now), [authoritative]);
  assert.deepEqual(selectUpcomingEvents([local], { ...authoritative, hidden: true }, now), []);
  assert.deepEqual(selectUpcomingEvents([local], null, now), []);
});
test('past recurring events, hidden events and invalid dates stay excluded', () => {
  const fixtures = [event('old', { date: '2026-09-01', recurring: 'weekly' }),
    event('hidden', { hidden: true }), event('bad-date', { date: '2026-02-30' }), event('bad-date-2', { date: 'invalid' })];
  assert.deepEqual(selectUpcomingEvents(fixtures, null, now), []);
});
test('Phoenix local date and end time govern same-day expiry', () => {
  const evening = event('evening', { date: '2026-09-21', endTime: '10:00 PM' });
  assert.equal(selectUpcomingEvents([evening], null, new Date('2026-09-22T04:59:00Z')).length, 1);
  assert.equal(selectUpcomingEvents([evening], null, new Date('2026-09-22T05:00:00Z')).length, 0);
  assert.equal(selectUpcomingEvents([evening], null, new Date('2026-09-22T07:00:00Z')).length, 0);
});
test('upcoming events sort chronologically, deduplicate, and cap at two', () => {
  const a = event('a', { date: '2026-09-23' });
  const b = event('b', { date: '2026-09-24' });
  assert.deepEqual(selectUpcomingEvents([event('c'), b, a, a], null, now), [a, b]);
});
