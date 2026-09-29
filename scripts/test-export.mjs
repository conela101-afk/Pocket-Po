// Tests the export calculations with obviously fake data. Run by `npm run check`.
import assert from 'node:assert/strict';
import { computeStats, toCSV, csvCell, weekStart, daysInclusive, addDays, validateBackup, makeBackup, BACKUP_STORES } from '../js/export-stats.js';
import { classify } from '../js/classify.js';

const tools = { a: { name: 'Tool A', run: 'guided' }, b: { name: 'Tool B', run: 'guided' }, note: { name: 'List', run: 'list' } };
let id = 0;
const S = (ts, o = {}) => ({ id: ++id, ts, dow: 0, block: 'evening', mode: 'library', toolId: 'a', category: 'body', opener: 'browse', durationSec: 60,
  completed: true, exitedEarly: false, opened: false, contentTool: false, handoffPressed: false, ratingBefore: null, ratingAfter: null, helped: null,
  triggers: [], context: [], body: [], note: null, ...o });
let fails = 0;
const test = (name, fn) => { try { fn(); } catch (e) { fails++; console.error('✗ test-export: ' + name + '\n  ' + e.message); } };

test('dates: weeks start on Monday, day counts are inclusive', () => {
  assert.equal(weekStart('2026-03-29'), '2026-03-23'); // a Sunday
  assert.equal(weekStart('2026-03-23'), '2026-03-23');
  assert.equal(daysInclusive('2026-03-23', '2026-03-29'), 7);
  assert.equal(addDays('2026-02-27', 2), '2026-03-01');
});

test('classify: opened, early, content, completed', () => {
  assert.equal(classify(S('2026-03-23T10:00:00+00:00', { completed: false, exitedEarly: true, durationSec: 2 }), tools), 'opened');
  assert.equal(classify(S('2026-03-23T10:00:00+00:00', { completed: false, exitedEarly: true, durationSec: 30 }), tools), 'early');
  assert.equal(classify(S('2026-03-23T10:00:00+00:00', { toolId: 'note', completed: false, exitedEarly: true, durationSec: 30 }), tools), 'content');
  assert.equal(classify(S('2026-03-23T10:00:00+00:00'), tools), 'completed');
});

test('days with and without use; clock change; recovery uses real time', () => {
  // Clocks in Ireland go forward on 2026-03-29 at 01:00 UTC. 00:30 UTC to 01:10 UTC is 40 minutes,
  // though the local clock reads 00:30 then 02:10.
  const all = [
    S('2026-03-23T09:00:00+00:00'), S('2026-03-25T09:00:00+00:00'),
    S('2026-03-29T00:30:00+00:00', { mode: 'now', ratingAfter: 4, block: 'night' }),
    S('2026-03-29T02:10:00+01:00', { ratingBefore: 2 })
  ];
  const st = computeStats(all, { from: '2026-03-23', to: '2026-03-29', tools });
  assert.equal(st.daysTotal, 7); assert.equal(st.daysUsed, 3); assert.equal(st.daysNone, 4);
  assert.equal(st.recovery.eligible, 1); assert.equal(st.recovery.found, 1); assert.equal(st.recovery.medianMin, 40);
  assert.equal(st.periods.length, 1); assert.equal(st.periods[0].now, 1); assert.equal(st.periods[0].library, 3);
  assert.equal(st.blocks.night, 1); assert.equal(st.nowCount, 1);
});

test('recovery: none when unrated, later than 3 hours, or not lower', () => {
  const all = [S('2026-03-23T09:00:00+00:00', { mode: 'now' }), S('2026-03-23T09:30:00+00:00', { ratingBefore: 1 }),
    S('2026-03-24T09:00:00+00:00', { mode: 'now', ratingAfter: 3 }), S('2026-03-24T12:01:00+00:00', { ratingBefore: 1 }),
    S('2026-03-25T09:00:00+00:00', { mode: 'now', ratingAfter: 3 }), S('2026-03-25T09:20:00+00:00', { ratingBefore: 3 })];
  const st = computeStats(all, { from: '2026-03-23', to: '2026-03-25', tools });
  assert.equal(st.recovery.eligible, 2); assert.equal(st.recovery.found, 0); assert.equal(st.recovery.medianMin, null);
});

test('early-exit rate leaves out opened sessions and content tools, and needs 3 sessions', () => {
  const t = '2026-03-23T10:00:00+00:00';
  const all = [
    ...[1, 2, 3].map(() => S(t)),
    ...[1, 2].map(() => S(t, { completed: false, exitedEarly: true, durationSec: 40 })),
    ...[1, 2, 3].map(() => S(t, { completed: false, exitedEarly: true, durationSec: 2 })),
    ...[1, 2, 3, 4].map(() => S(t, { toolId: 'note', completed: false, exitedEarly: true, durationSec: 90 })),
    ...[1, 2].map(() => S(t, { toolId: 'b', completed: false, exitedEarly: true, durationSec: 40 }))
  ];
  const st = computeStats(all, { from: '2026-03-23', to: '2026-03-23', tools });
  assert.deepEqual(st.earlyRate.map((e) => [e.id, e.early, e.of]), [['a', 2, 5]]);
  assert.equal(st.opened, 3);
});

test('long ranges group by month and cap the rows', () => {
  const st = computeStats([S('2026-03-23T10:00:00+00:00')], { from: '2023-01-01', to: '2026-03-31', tools });
  assert.equal(st.weekly, false); assert.equal(st.periods.length, 24); assert.equal(st.periodsCapped, true);
  assert.equal(st.periods.at(-1).key, '2026-03'); assert.equal(st.periods.at(-1).library, 1);
});

test('tag counts, helped and handoff', () => {
  const all = [S('2026-03-23T10:00:00+00:00', { triggers: ['Sensory', 'Not sure'], helped: 'helped', handoffPressed: true }),
    S('2026-03-24T10:00:00+00:00', { triggers: ['Sensory'], helped: 'didnt', context: ['Home'] })];
  const st = computeStats(all, { from: '2026-03-23', to: '2026-03-24', tools });
  assert.deepEqual(st.triggers[0], ['Sensory', 2]); assert.deepEqual(st.context, [['Home', 1]]);
  assert.equal(st.handoff, 1); assert.equal(st.helpedMost[0].n, 1); assert.deepEqual(st.helped, { helped: 1, neutral: 0, didnt: 1 });
});

test('CSV: quotes, commas, newlines and formula guard; notes only when chosen', () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`);
  assert.equal(csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(csvCell(null), ''); assert.equal(csvCell(5), '5'); assert.equal(csvCell(false), 'false');
  const a = S('2026-03-23T10:00:00+00:00', { note: '+1 note', triggers: ['x', 'y'] }), b = S('2026-03-22T10:00:00+00:00', { note: 'other' });
  const csv = toCSV([a, b], tools, new Set([a.id]));
  const lines = csv.replace('﻿', '').trim().split('\r\n');
  assert.equal(lines.length, 3); // header + 2 rows, oldest first
  assert.ok(lines[2].includes(`"'+1 note"`)); assert.ok(!lines[1].includes('other')); assert.ok(lines[2].includes('"x; y"'));
});

test('backup: round-trips, and rejects the wrong file', () => {
  const stores = Object.fromEntries(BACKUP_STORES.map((s) => [s, s === 'sessions' ? [S('2026-03-23T10:00:00+00:00')] : []]));
  const v = validateBackup(makeBackup(stores, { afterRow: true }, '2026-03-30T10:00:00+00:00'));
  assert.equal(v.ok, true); assert.deepEqual(v.stores, stores); assert.deepEqual(v.settings, { afterRow: true }); assert.equal(v.counts.sessions, 1);
  assert.equal(validateBackup('not json').ok, false);
  assert.equal(validateBackup('{"app":"other","stores":{}}').ok, false);
  assert.equal(validateBackup(JSON.stringify({ app: 'pocket-po', backupVersion: 99, stores: {} })).error, 'newer');
  assert.equal(validateBackup(JSON.stringify({ app: 'pocket-po', backupVersion: 1, stores: { sessions: [{ noId: 1 }] } })).ok, false);
});

if (fails) { console.error(`✗ ${fails} export test(s) failed`); process.exit(1); }
console.log('export tests passed');
