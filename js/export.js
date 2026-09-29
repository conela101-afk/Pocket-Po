// More → Export. Manual only: nothing is sent anywhere; files are saved or shared by the user.
// Formats: appointment summary and detailed report (printed from the browser), CSV, and a JSON backup with restore.
import { t, tools as allTools } from './data.js';
import { getAll, dumpAll, replaceAll, nowISO } from './db.js';
import { exportSettings, replaceSettings } from './settings.js';
import { computeStats, toCSV, validateBackup, makeBackup, addDays, dayKey } from './export-stats.js';
import { go } from './router.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const view = () => document.getElementById('view');
const toolsById = () => Object.fromEntries(allTools().map((x) => [x.id, x]));
const safeAll = (s) => getAll(s).catch(() => []);
const fill = (str, o) => str.replace(/\{(\w+)\}/g, (_, k) => o[k]);
const today = () => nowISO().slice(0, 10);

const state = { from: null, to: null, prep: false, notes: new Set() };
const ensureRange = () => { if (!state.to) { state.to = today(); state.from = addDays(state.to, -27); } };

export function exportScreen(kind) {
  ensureRange();
  return kind === 'summary' || kind === 'detailed' ? report(kind) : options();
}

// ---------- saving files ----------
async function saveFile(name, text, type) {
  const file = new File([text], name, { type });
  const touch = /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
  if (touch && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const url = URL.createObjectURL(file);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ---------- options screen ----------
async function options() {
  const v = view();
  v.innerHTML = `<h1>${esc(t('export.title'))}</h1><p class="muted">${esc(t('export.intro'))}</p>
    <h2>${esc(t('export.range'))}</h2>
    <div class="chips"><button data-p="4w">${esc(t('export.last4'))}</button><button data-p="3m">${esc(t('export.last3m'))}</button><button data-p="all">${esc(t('export.all'))}</button></div>
    <div class="row" style="margin-top:.75rem"><label class="field grow"><span>${esc(t('export.from'))}</span><input type="date" id="from" value="${state.from}"></label>
      <label class="field grow"><span>${esc(t('export.to'))}</span><input type="date" id="to" value="${state.to}"></label></div>
    <h2>${esc(t('export.include'))}</h2>
    <label class="setting"><span>${esc(t('export.prep'))}</span><input type="checkbox" id="prep" ${state.prep ? 'checked' : ''}></label>
    <p class="muted" style="margin:.5rem 0 .25rem">${esc(t('export.notes'))}. ${esc(t('export.notesCsv'))}</p><div class="stack" id="notes"></div>
    <div class="stack" style="margin-top:1.25rem">
      <a class="btn primary" href="#/export/summary">${esc(t('export.makeSummary'))}</a>
      <a class="btn" href="#/export/detailed">${esc(t('export.makeDetailed'))}</a>
      <button id="csv">${esc(t('export.makeCsv'))}</button>
      <button id="json">${esc(t('export.makeJson'))}</button><p class="muted">${esc(t('export.jsonNote'))}</p>
    </div>
    <h2>${esc(t('export.restore'))}</h2><p class="muted">${esc(t('export.restoreIntro'))} ${esc(t('export.restoreNote'))}</p>
    <input type="file" id="file" accept=".json,application/json" hidden>
    <button id="pick">${esc(t('export.restore'))}</button><div id="restoreMsg" role="status" style="margin-top:.75rem"></div>
    <p style="margin-top:1.5rem"><a class="btn" href="#/more">${esc(t('export.back'))}</a></p>`;

  const $ = (s) => v.querySelector(s);
  const sync = () => {
    state.from = $('#from').value || state.from; state.to = $('#to').value || state.to;
    if (state.from > state.to) [state.from, state.to] = [state.to, state.from];
    drawNotes();
  };
  const drawNotes = async () => {
    const rows = (await safeAll('sessions')).filter((s) => s.note && dayKey(s.ts) >= state.from && dayKey(s.ts) <= state.to).sort((a, b) => a.ts.localeCompare(b.ts));
    const box = $('#notes'); if (!box) return;
    box.innerHTML = rows.length ? rows.map((s) => `<label class="setting card"><span><small class="muted">${esc(dayKey(s.ts))} · ${esc(toolsById()[s.toolId]?.name || s.toolId)}</small><br>${esc(s.note.length > 90 ? s.note.slice(0, 90) + '…' : s.note)}</span>
      <input type="checkbox" data-n="${s.id}" ${state.notes.has(s.id) ? 'checked' : ''}></label>`).join('') : `<p class="muted">${esc(t('export.notesNone'))}</p>`;
    box.querySelectorAll('[data-n]').forEach((c) => c.onchange = () => { c.checked ? state.notes.add(+c.dataset.n) : state.notes.delete(+c.dataset.n); });
  };
  $('#from').onchange = sync; $('#to').onchange = sync;
  $('#prep').onchange = (e) => { state.prep = e.target.checked; };
  v.querySelectorAll('[data-p]').forEach((b) => b.onclick = async () => {
    state.to = today();
    if (b.dataset.p === '4w') state.from = addDays(state.to, -27);
    if (b.dataset.p === '3m') state.from = addDays(state.to, -90);
    if (b.dataset.p === 'all') state.from = (await safeAll('sessions')).map((s) => dayKey(s.ts)).sort()[0] || state.to;
    $('#from').value = state.from; $('#to').value = state.to; drawNotes();
  });
  drawNotes();

  $('#csv').onclick = async () => {
    const rows = computeStats(await safeAll('sessions'), { from: state.from, to: state.to, tools: toolsById() }).rows;
    await saveFile(`pocket-po-sessions-${today()}.csv`, toCSV(rows, toolsById(), state.notes), 'text/csv');
  };
  $('#json').onclick = async () => {
    await saveFile(`pocket-po-backup-${today()}.json`, makeBackup(await dumpAll(), exportSettings(), nowISO()), 'application/json');
  };

  // Restore: choose a file, see what is in it, then confirm. The swap is one transaction, so it all happens or none of it does.
  const msg = $('#restoreMsg');
  $('#pick').onclick = () => $('#file').click();
  $('#file').onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    const r = validateBackup(await f.text().catch(() => ''));
    if (!r.ok) { msg.textContent = t(r.error === 'newer' ? 'export.restoreNewer' : 'export.restoreBad'); return; }
    const names = t('export.storeNames');
    const has = Object.entries(r.counts).filter(([, n]) => n).map(([k, n]) => `${n} ${names[k]}`).join(', ') || '0';
    msg.innerHTML = `<div class="notice"><p>${esc(t('export.backupHas'))}: ${esc(has)}${r.exportedAt ? ` (${esc(t('export.from2'))} ${esc(r.exportedAt.slice(0, 10))})` : ''}.</p>
      <p>${esc(t('export.restoreNote'))}</p>
      <div class="stack"><button class="primary" id="go">${esc(t('export.restoreGo'))}</button><button id="no">${esc(t('export.cancel'))}</button></div></div>`;
    msg.querySelector('#no').onclick = () => { msg.textContent = ''; };
    msg.querySelector('#go').onclick = async () => {
      try { await replaceAll(r.stores); replaceSettings(r.settings); msg.textContent = t('export.restoreDone'); setTimeout(() => go('/home'), 600); }
      catch { msg.textContent = t('export.restoreFailed'); }
    };
  };
}

// ---------- reports ----------
const R = (k) => t('export.report.' + k);
const table = (head, rows) => `<table><thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const catName = (c) => { const n = R('catNames.' + c); return n.startsWith('export.') ? c : n; };
const none = () => `<p class="muted">${esc(R('none'))}</p>`;
/** A table with one row of values under a row of labels. */
const rowTable = (labels, values) => table(labels, [values]);
const cols = (items, cls = '') => `<div class="cols ${cls}" style="--n:${items.length}">${items.map((x) => `<div>${x}</div>`).join('')}</div>`;
const countTable = (label, rows) => (rows.length ? table([label, R('count')], rows) : none());

async function report(kind) {
  const detailed = kind === 'detailed';
  const tools = toolsById();
  const st = computeStats(await safeAll('sessions'), { from: state.from, to: state.to, tools });
  const points = state.prep ? (await safeAll('prepPoints')).sort((a, b) => (a.ts || '').localeCompare(b.ts || '')) : [];
  const notes = st.rows.filter((s) => s.note && state.notes.has(s.id)).sort((a, b) => a.ts.localeCompare(b.ts));
  const top = detailed ? 10 : 5;
  const sec = (title, body) => `<section><h2>${esc(title)}</h2>${body}</section>`;

  const periodHead = [R(st.weekly ? 'week' : 'month'), R('now'), R('build'), R('library')];
  const mon = R('months');
  const label = (k) => (k.length === 7 ? `${mon[+k.slice(5) - 1]} ${k.slice(0, 4)}` : `${+k.slice(8)} ${mon[+k.slice(5, 7) - 1]} ${k.slice(0, 4)}`);
  const periodRows = st.periods.map((p) => [label(p.key), p.now, p.build, p.library]);
  const chunks = []; // tables of at most 9 rows, side by side
  for (let i = 0; i < periodRows.length; i += 9) chunks.push(periodRows.slice(i, i + 9));
  const periodTable = cols(chunks.map((c) => table(periodHead, c)), 'periods');

  const rec = st.recovery;
  const recovery = rec.medianMin == null
    ? `<p>${esc(R('recoveryLine'))} <strong>${esc(R('recoveryNA'))}</strong></p>`
    : `<p>${esc(R('recoveryLine'))} <strong>${Math.round(rec.medianMin)}</strong>. ${esc(fill(R('recoveryOf'), rec))}</p>`;

  const early = st.earlyRate.slice(0, top).map((e) => [e.name, `${e.early} ${R('of')} ${e.of} (${Math.round((100 * e.early) / e.of)}%)`]);
  const html = `
    <h1>${esc(R(detailed ? 'detailedTitle' : 'summaryTitle'))}</h1>
    <p>${esc(R('range'))}: ${esc(st.from)} – ${esc(st.to)}. ${esc(R('prepared'))}: ${esc(today())}.</p>
    ${sec(R('secUse'), rowTable([R('daysUse'), R('daysNone'), R('sessions'), R('opened'), R('handoff')], [st.daysUsed, st.daysNone, st.sessions, st.opened, st.handoff]))}
    ${sec(R('secPeriod'), periodTable + (st.periodsCapped ? `<p class="muted">${esc(R('capped'))}</p>` : ''))}
    ${sec(R('secBlocks'), rowTable(Object.keys(st.blocks).map((b) => R('blocks.' + b)), Object.values(st.blocks)))}
    ${sec(R('secTools'), cols([
      `<h3>${esc(R('mostUsed'))}</h3>${countTable(R('tool'), st.mostUsed.slice(0, top).map((x) => [x.name, x.n]))}`,
      `<h3>${esc(R('helpedMost'))}</h3>${countTable(R('tool'), st.helpedMost.slice(0, top).map((x) => [x.name, x.n]))}`,
      `<h3>${esc(R('earlyRate'))}</h3>${early.length ? table([R('tool'), R('early')], early) : none()}`]) + `<p class="muted">${esc(R('earlyNote'))}</p>`)}
    ${sec(R('secTags'), cols([
      `<h3>${esc(R('triggers'))}</h3>${countTable('', st.triggers.slice(0, top * 2))}`,
      `<h3>${esc(R('context'))}</h3>${countTable('', st.context.slice(0, top * 2))}`,
      ...(detailed && st.body.length ? [`<h3>${esc(R('body'))}</h3>${countTable('', st.body.slice(0, 10))}`] : [])]))}
    ${sec(R('secRecovery'), recovery + `<p class="muted">${esc(R('recoveryCaveat'))}</p>`)}
    ${detailed ? `${sec(R('secDow'), rowTable(R('dow'), st.dow.slice(1).concat(st.dow[0])))}
      ${sec(R('secHelped'), rowTable([R('helped'), R('neutral'), R('didnt')], [st.helped.helped, st.helped.neutral, st.helped.didnt]))}
      ${sec(R('secRatings'), rowTable(R('ratingLabels'), st.ratings))}
      ${sec(R('secCategory'), table([R('category'), R('sessions'), R('completed'), R('earlyCol'), R('openedCol')],
        st.categories.map((c) => [catName(c.category), c.sessions, c.completed, c.early, c.opened])))}` : ''}
    ${points.length ? sec(R('secPoints'), `<ul>${points.map((p) => `<li>${esc(p.text)}${p.raised ? ` <span class="muted">(${esc(R('raised'))})</span>` : ''}</li>`).join('')}</ul>`) : ''}
    ${notes.length ? sec(R('secNotes'), notes.map((s) => `<p><small class="muted">${esc(dayKey(s.ts))} · ${esc(tools[s.toolId]?.name || s.toolId)}</small><br>${esc(s.note)}</p>`).join('')) : ''}
    <p class="footer">${esc(t('export.footer'))}</p>`;

  view().innerHTML = `<div class="noprint stack"><button class="primary" id="print">${esc(t('export.print'))}</button><a class="btn" href="#/export">${esc(t('export.back'))}</a></div>
    <article class="report ${kind}">${html}</article>`;
  view().querySelector('#print').onclick = () => window.print();
}
