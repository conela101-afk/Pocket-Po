// IndexedDB: session logs and user content. Nothing leaves the device.
const NAME = 'pocketpo';
// Schema changes: bump VERSION and add a MIGRATIONS entry. Migrations only ever add; they never drop or rewrite records.
const VERSION = 1;
const STORES = ['sessions', 'evidence', 'parkingLot', 'contingencies', 'prepPoints', 'favourites', 'tagsConfig', 'settings', 'poState'];
const MIGRATIONS = []; // [[2, (db, tx) => {...}], ...]
let dbp;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      for (const s of STORES) {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id', autoIncrement: true });
      }
      for (const [v, fn] of MIGRATIONS) if (e.oldVersion < v) fn(db, req.transaction);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

async function run(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req.result);
    tx.onerror = () => reject(tx.error);
  });
}

export const put = (store, obj) => run(store, 'readwrite', (s) => s.put(obj));
export const get = (store, id) => run(store, 'readonly', (s) => s.get(id));
export const getAll = (store) => run(store, 'readonly', (s) => s.getAll());
export const remove = (store, id) => run(store, 'readwrite', (s) => s.delete(id));

export function timeBlock(d = new Date()) {
  const h = d.getHours();
  if (h >= 5 && h < 9) return 'earlyMorning';
  if (h >= 9 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function localISO(d) {
  const p = (n) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${sign}${p(Math.floor(Math.abs(off) / 60))}:${p(Math.abs(off) % 60)}`;
}

/** Records what the app can observe with no input from the user. */
async function logSessionUnsafe({ tool, mode, opener, startedAt, completed, exitedEarly }) {
  const start = new Date(startedAt);
  const all = await getAll('sessions');
  let gap = null;
  if (mode === 'now') {
    const prev = all.filter((s) => s.mode === 'now').sort((a, b) => b.ts.localeCompare(a.ts))[0];
    if (prev) gap = Math.round((start - new Date(prev.ts)) / 1000);
  }
  const rec = {
    ts: localISO(start), dow: start.getDay(), block: timeBlock(start), mode,
    toolId: tool.id, category: tool.category, opener,
    durationSec: Math.round((Date.now() - startedAt) / 1000),
    completed: !!completed, exitedEarly: !!exitedEarly,
    gapSincePrevNowSec: gap, handoffPressed: false,
    ratingBefore: null, ratingAfter: null, helped: null,
    triggers: [], context: [], body: [], note: null, voiceNoteId: null
  };
  rec.id = await put('sessions', rec);
  return rec;
}

/** Logging never throws: if storage fails the tool carries on and the user sees nothing. */
export async function logSession(args) {
  try { return await logSessionUnsafe(args); } catch { return null; }
}

export async function markHandoff() {
  try {
  const all = await getAll('sessions');
  const last = all.filter((s) => s.mode === 'now').sort((a, b) => b.ts.localeCompare(a.ts))[0];
  if (last) { last.handoffPressed = true; await put('sessions', last); }
  } catch { /* silent */ }
}

export async function requestPersistence() {
  try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch { /* fine */ }
}
