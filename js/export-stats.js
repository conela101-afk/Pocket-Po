// Export calculations. Pure functions with no browser or storage access, so scripts can test them.
// Everything here is descriptive: counts and simple definitions, never interpretation.
import { classify } from './classify.js';

export const BLOCKS = ['earlyMorning', 'morning', 'afternoon', 'evening', 'night'];
export const RECOVERY_WINDOW_MIN = 180;
export const MIN_SESSIONS_FOR_RATE = 3;
export const MAX_PERIODS = 24;

const p2 = (n) => String(n).padStart(2, '0');
/** Local calendar day of a stored ISO timestamp (the stored text is already local time). */
export const dayKey = (ts) => ts.slice(0, 10);
const utc = (k) => Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10));
const isoDay = (ms) => { const d = new Date(ms); return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`; };
export const addDays = (k, n) => isoDay(utc(k) + n * 86400000);
export const daysInclusive = (from, to) => Math.round((utc(to) - utc(from)) / 86400000) + 1;
/** Monday of the week containing the day. */
export const weekStart = (k) => addDays(k, -((new Date(utc(k)).getUTCDay() + 6) % 7));
export const inRange = (s, from, to) => { const k = dayKey(s.ts); return k >= from && k <= to; };

const count = (arr) => { const m = new Map(); for (const x of arr) m.set(x, (m.get(x) || 0) + 1); return m; };
const ranked = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
const median = (xs) => { if (!xs.length) return null; const a = [...xs].sort((x, y) => x - y), h = a.length >> 1; return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; };

/**
 * Minutes from a Now session to the next session (any mode) within 3 hours whose "before" rating is
 * lower than the Now session's rating. Real instants are compared, so clock changes cannot distort it.
 */
export function recovery(all, inRangeRows) {
  const sorted = [...all].sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
  const rated = inRangeRows.filter((s) => s.mode === 'now' && s.ratingAfter != null);
  const minutes = [];
  for (const n of rated) {
    const t0 = Date.parse(n.ts);
    const next = sorted.find((s) => s.id !== n.id && Date.parse(s.ts) > t0 && Date.parse(s.ts) - t0 <= RECOVERY_WINDOW_MIN * 60000
      && s.ratingBefore != null && s.ratingBefore < n.ratingAfter);
    if (next) minutes.push((Date.parse(next.ts) - t0) / 60000);
  }
  return { eligible: rated.length, found: minutes.length, medianMin: median(minutes) };
}

export function computeStats(all, { from, to, tools = {} }) {
  if (from > to) [from, to] = [to, from];
  const rows = all.filter((s) => inRange(s, from, to));
  const kind = new Map(rows.map((s) => [s, classify(s, tools)]));
  const total = daysInclusive(from, to), used = new Set(rows.map((s) => dayKey(s.ts))).size;

  // Periods: weeks for up to 26 weeks, otherwise months (latest MAX_PERIODS shown).
  const weekly = total <= 26 * 7;
  const keyOf = (s) => (weekly ? weekStart(dayKey(s.ts)) : dayKey(s.ts).slice(0, 7));
  const keys = [];
  if (weekly) for (let k = weekStart(from); k <= to; k = addDays(k, 7)) keys.push(k);
  else for (let y = +from.slice(0, 4), m = +from.slice(5, 7); `${y}-${p2(m)}` <= to.slice(0, 7); m === 12 ? (y++, m = 1) : m++) keys.push(`${y}-${p2(m)}`);
  const per = new Map(keys.map((k) => [k, { key: k, now: 0, build: 0, library: 0 }]));
  for (const s of rows) per.get(keyOf(s))[s.mode]++;
  const periods = [...per.values()];

  const now = rows.filter((s) => s.mode === 'now');
  const blocks = Object.fromEntries(BLOCKS.map((b) => [b, now.filter((s) => s.block === b).length]));
  const name = (id) => tools[id]?.name || id;

  const eligible = rows.filter((s) => ['completed', 'early'].includes(kind.get(s)));
  const byTool = new Map();
  for (const s of eligible) { const e = byTool.get(s.toolId) || { id: s.toolId, name: name(s.toolId), early: 0, of: 0 }; e.of++; if (kind.get(s) === 'early') e.early++; byTool.set(s.toolId, e); }
  const earlyRate = [...byTool.values()].filter((e) => e.of >= MIN_SESSIONS_FOR_RATE && e.early > 0)
    .sort((a, b) => b.early / b.of - a.early / a.of || b.early - a.early || a.name.localeCompare(b.name));

  const tag = (field) => ranked(count(rows.flatMap((s) => s[field] || [])));
  const cat = new Map();
  for (const s of rows) { const e = cat.get(s.category) || { category: s.category, sessions: 0, completed: 0, early: 0, opened: 0 }; e.sessions++; const k = kind.get(s); if (k === 'completed' || k === 'content') e.completed++; else e[k]++; cat.set(s.category, e); }

  return {
    from, to, weekly, daysTotal: total, daysUsed: used, daysNone: total - used,
    sessions: rows.length, opened: [...kind.values()].filter((k) => k === 'opened').length,
    periods: weekly ? periods : periods.slice(-MAX_PERIODS), periodsCapped: !weekly && periods.length > MAX_PERIODS,
    blocks, nowCount: now.length,
    mostUsed: ranked(count(rows.map((s) => s.toolId))).map(([id, n]) => ({ id, name: name(id), n })),
    helpedMost: ranked(count(rows.filter((s) => s.helped === 'helped').map((s) => s.toolId))).map(([id, n]) => ({ id, name: name(id), n })),
    earlyRate,
    triggers: tag('triggers'), context: tag('context'), body: tag('body'),
    handoff: rows.filter((s) => s.handoffPressed).length,
    recovery: recovery(all, rows),
    dow: [0, 1, 2, 3, 4, 5, 6].map((d) => rows.filter((s) => s.dow === d).length),
    ratings: [1, 2, 3, 4, 5].map((n) => rows.filter((s) => s.ratingAfter === n).length),
    helped: { helped: rows.filter((s) => s.helped === 'helped').length, neutral: rows.filter((s) => s.helped === 'neutral').length, didnt: rows.filter((s) => s.helped === 'didnt').length },
    categories: [...cat.values()].sort((a, b) => b.sessions - a.sessions || a.category.localeCompare(b.category)),
    rows
  };
}

// ---- CSV ----
export const CSV_COLUMNS = ['id', 'ts', 'dow', 'block', 'mode', 'toolId', 'toolName', 'category', 'opener', 'durationSec', 'outcome', 'completed', 'exitedEarly', 'opened',
  'contentTool', 'gapSincePrevNowSec', 'handoffPressed', 'ratingBefore', 'ratingAfter', 'helped', 'triggers', 'context', 'body', 'note'];

/** Text cells are always quoted, and a leading = + - @ is defused so spreadsheets never run it as a formula. */
export const csvCell = (v) => {
  if (v == null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return `"${s.replace(/"/g, '""')}"`;
};

/** One row per session. Notes are included only for ids in `noteIds`. */
export function toCSV(rows, tools = {}, noteIds = new Set()) {
  const line = (s) => CSV_COLUMNS.map((c) => {
    if (c === 'toolName') return csvCell(tools[s.toolId]?.name || '');
    if (c === 'outcome') return csvCell(classify(s, tools));
    if (c === 'note') return csvCell(noteIds.has(s.id) ? s.note : null);
    if (['triggers', 'context', 'body'].includes(c)) return csvCell((s[c] || []).join('; '));
    if (c === 'opened') return csvCell(classify(s, tools) === 'opened');
    if (c === 'exitedEarly') return csvCell(classify(s, tools) === 'early');
    return csvCell(s[c]);
  }).join(',');
  return '﻿' + [CSV_COLUMNS.join(','), ...[...rows].sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts)).map(line)].join('\r\n') + '\r\n';
}

// ---- Backup ----
export const BACKUP_VERSION = 1;
export const BACKUP_STORES = ['sessions', 'evidence', 'parkingLot', 'contingencies', 'prepPoints', 'favourites', 'tagsConfig', 'settings', 'poState'];

/** Returns { ok, error?, stores?, settings?, counts? }. Nothing is changed by validating. */
export function validateBackup(text) {
  let d;
  try { d = JSON.parse(text); } catch { return { ok: false, error: 'bad' }; }
  if (!d || d.app !== 'pocket-po' || typeof d.stores !== 'object' || d.stores === null) return { ok: false, error: 'bad' };
  if (typeof d.backupVersion !== 'number') return { ok: false, error: 'bad' };
  if (d.backupVersion > BACKUP_VERSION) return { ok: false, error: 'newer' };
  const stores = {}, counts = {};
  for (const s of BACKUP_STORES) {
    const arr = d.stores[s] ?? [];
    if (!Array.isArray(arr) || arr.some((r) => r === null || typeof r !== 'object' || r.id == null)) return { ok: false, error: 'bad' };
    stores[s] = arr; counts[s] = arr.length;
  }
  const settings = d.settings && typeof d.settings === 'object' && !Array.isArray(d.settings) ? d.settings : {};
  return { ok: true, stores, settings, counts, exportedAt: d.exportedAt || '' };
}

export function makeBackup(stores, settings, exportedAt) {
  return JSON.stringify({ app: 'pocket-po', backupVersion: BACKUP_VERSION, exportedAt, stores, settings }, null, 1);
}
