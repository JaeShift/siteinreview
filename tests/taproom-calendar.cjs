const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, relative);
  const mod = new Module(filename, module);
  mod.paths = module.paths;
  const original = mod.require.bind(mod);
  mod.require = name => overrides[name] ?? original(name);
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, filename);
  return mod.exports;
}
const dates = load('../lib/taproom-calendar.ts');
const { parseTaproomCalendar } = load('../lib/taproom-calendar-feed.ts', { './taproom-calendar': dates });
const zone = `BEGIN:VTIMEZONE\nTZID:America/Phoenix\nBEGIN:STANDARD\nTZOFFSETFROM:-0700\nTZOFFSETTO:-0700\nDTSTART:19700101T000000\nEND:STANDARD\nEND:VTIMEZONE`;
const calendar = (...events) => ['BEGIN:VCALENDAR', 'VERSION:2.0', zone, ...events.map(event => `BEGIN:VEVENT\n${event}\nEND:VEVENT`), 'END:VCALENDAR'].join('\r\n');
const parse = (...events) => parseTaproomCalendar(calendar(...events), new Date('2026-09-01T07:00:00Z'), new Date('2026-10-01T07:00:00Z'));
const series = `UID:weekly\nSUMMARY:Commander\nDTSTART;TZID=America/Phoenix:20260825T173000\nDTEND;TZID=America/Phoenix:20260825T210000\nRRULE:FREQ=WEEKLY;BYDAY=TU\nEXDATE;TZID=America/Phoenix:20260908T173000`;

test('recurring events retain Phoenix times and exclude cancellations and EXDATEs', () => {
  const events = parse(series,
    'UID:weekly\nRECURRENCE-ID;TZID=America/Phoenix:20260915T173000\nDTSTART;TZID=America/Phoenix:20260915T173000\nDTEND;TZID=America/Phoenix:20260915T210000\nSTATUS:CANCELLED');
  assert.deepEqual(events.map(event => event.date), ['2026-09-01', '2026-09-22', '2026-09-29']);
  assert.equal(dates.eventTime(events[0]), '5:30 PM');
  assert.equal(events[0].start, '2026-09-02T00:30:00.000Z');
});

test('moved recurrence replaces its original occurrence without duplicates', () => {
  const events = parse(series, 'UID:weekly\nRECURRENCE-ID;TZID=America/Phoenix:20260922T173000\nDTSTART;TZID=America/Phoenix:20260923T180000\nDTEND;TZID=America/Phoenix:20260923T210000\nSUMMARY:Moved Commander');
  assert.equal(events.filter(event => event.title === 'Moved Commander').length, 1);
  assert.ok(!events.some(event => event.date === '2026-09-22'));
  assert.equal(events.find(event => event.title === 'Moved Commander').date, '2026-09-23');
});

test('all-day exclusive ends and overnight events map to their actual local days', () => {
  const events = parse('UID:all-day\nSUMMARY:Festival\nDTSTART;VALUE=DATE:20260903\nDTEND;VALUE=DATE:20260905', 'UID:night\nSUMMARY:Late music\nDTSTART:20260905T060000Z\nDTEND:20260905T080000Z');
  assert.equal(events[0].date, '2026-09-03');
  assert.equal(events[0].endDate, '2026-09-04');
  assert.equal(events[0].allDay, true);
  assert.equal(dates.eventsOnDate(events, '2026-09-04').length, 2);
  assert.equal(dates.eventsOnDate(events, '2026-09-05').length, 1);
});

test('floating dates use Phoenix regardless of the host timezone', () => {
  const events = parse('UID:floating\nSUMMARY:Taproom\nDTSTART:20260904T190000\nDTEND:20260904T210000');
  assert.equal(events[0].start, '2026-09-05T02:00:00.000Z');
});

test('cancelled masters stay cancelled, including their moved instances', () => {
  assert.equal(parse(`${series}\nSTATUS:CANCELLED`, 'UID:weekly\nRECURRENCE-ID;TZID=America/Phoenix:20260922T173000\nDTSTART;TZID=America/Phoenix:20260923T180000\nDTEND;TZID=America/Phoenix:20260923T210000').length, 0);
});

test('month and week navigation handle year changes and leap days', () => {
  assert.equal(dates.shiftMonth('2026-12', 1), '2027-01');
  assert.equal(dates.shiftMonth('2026-01', -1), '2025-12');
  assert.equal(dates.startOfWeek('2027-01-01'), '2026-12-28');
  assert.equal(dates.addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(dates.phoenixDate(new Date('2026-09-30T06:00:00Z')), '2026-09-29');
});

test('an exception cannot cancel an unrelated series at the same time', () => {
  const other = series.replace('UID:weekly', 'UID:other').replace('SUMMARY:Commander', 'SUMMARY:Other game');
  const events = parse(series, other, 'UID:weekly\nRECURRENCE-ID;TZID=America/Phoenix:20260915T173000\nDTSTART;TZID=America/Phoenix:20260915T173000\nDTEND;TZID=America/Phoenix:20260915T210000\nSTATUS:CANCELLED');
  assert.deepEqual(events.filter(event => event.date === '2026-09-15').map(event => event.title), ['Other game']);
});

test('weekly lineup excludes ended events while retaining ongoing and future events', () => {
  const now = Date.parse('2026-09-30T19:00:00Z'); // Wednesday noon in Phoenix.
  const event = (id, date, endDate, end) => ({ id, date, endDate, end });
  const events = [
    event('yesterday', '2026-09-29', '2026-09-29', '2026-09-30T04:00:00Z'),
    event('ended-today', '2026-09-30', '2026-09-30', '2026-09-30T18:00:00Z'),
    event('ends-now', '2026-09-30', '2026-09-30', '2026-09-30T19:00:00Z'),
    event('ongoing', '2026-09-30', '2026-09-30', '2026-09-30T20:00:00Z'),
    event('all-day', '2026-09-30', '2026-09-30', '2026-10-01T07:00:00Z'),
    event('tomorrow', '2026-10-01', '2026-10-01', '2026-10-02T04:00:00Z'),
    event('next-week', '2026-10-05', '2026-10-05', '2026-10-06T04:00:00Z'),
  ];
  assert.deepEqual(dates.upcomingWeekEvents(events, '2026-09-28', now).map(event => event.id), ['ongoing', 'all-day', 'tomorrow']);
  assert.deepEqual(dates.upcomingWeekEvents(events, '2026-10-05', now).map(event => event.id), ['next-week']);
  assert.deepEqual(dates.upcomingWeekEvents(events, '2026-09-21', now), []);
});

test('weekly lineup advances at Phoenix midnight and expires events as time passes', () => {
  const events = [{ id: 'sunday', date: '2026-09-27', endDate: '2026-09-27', end: '2026-09-28T07:00:00Z' }];
  assert.equal(dates.upcomingWeekEvents(events, '2026-09-21', Date.parse('2026-09-28T06:59:00Z')).length, 1);
  assert.equal(dates.upcomingWeekEvents(events, '2026-09-21', Date.parse('2026-09-28T07:00:00Z')).length, 0);
  assert.equal(dates.upcomingWeekEvents(events, '2026-09-28', Date.parse('2026-09-28T07:00:00Z')).length, 0);
});
