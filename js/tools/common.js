// Shared helpers for tool screens: timers that clean up on leaving, and a soft-ended session shell.
import { t } from '../data.js';
import { logSession } from '../db.js';
import { poHTML, setPo } from '../po.js';
import { go } from '../router.js';
import { showAfterRow } from './afterrow.js';

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let handles = [];
export const later = (fn, ms) => { const id = setTimeout(fn, ms); handles.push(id); return id; };
export const every = (fn, ms) => { const id = setInterval(fn, ms); handles.push(id); return id; };
export function cancelAll() { handles.forEach((id) => { clearTimeout(id); clearInterval(id); }); handles = []; }
addEventListener('hashchange', cancelAll);

export const backTo = (mode) => (mode === 'now' ? '/now' : '/home');

/**
 * A tool with a Stop button and a soft end. Stop exits at once and logs "exited early".
 * At `dur` seconds Po yawns and settles and the tool ends by itself (logged as completed).
 * With no `dur` the tool ends only when `finish(true)` is called. `mount({ po, stage, isEnded, finish, setHint })` wires up the tool's own interaction.
 */
export function runSession(view, tool, mode, opener, { dur = 0, poState = 'sit', poSize = '', stage = '', hint = '', endMessage, mount }) {
  cancelAll();
  const startedAt = Date.now();
  let ended = false;
  view.innerHTML = `
    <div class="center">${poHTML(poState, poSize)}</div>
    <div id="stage">${stage}</div>
    <p class="phase" id="msg">${esc(hint)}</p>
    ${tool.caution ? `<div class="center"><button id="info" aria-label="${esc(t('tool.cautionTitle'))}">${esc(t('tool.info'))}</button></div><div id="cautionSlot"></div>` : ''}
    <div class="stopbar stack" id="bar"><button class="primary" id="stop">${esc(t('now.stop'))}</button></div>`;
  const po = view.querySelector('.po');
  const msg = view.querySelector('#msg');

  const finish = async (completed) => {
    if (ended) return;
    ended = true; cancelAll();
    if (completed) {
      setPo(po, 'yawn-settle', { dur: 3 });
      view.querySelector('#stage').classList.add('settled');
      msg.textContent = endMessage || t('tool.settled');
      view.querySelector('#bar').innerHTML = `<a class="btn primary" href="#${backTo(mode)}">${esc(t('now.back'))}</a>`;
    }
    const rec = await logSession({ tool, mode, opener, startedAt, completed, exitedEarly: !completed });
    if (!completed) return go(backTo(mode));
    showAfterRow(view.querySelector('#bar'), rec); // only after a tool ends by itself, never on Stop
  };
  view.querySelector('#stop').onclick = () => finish(false);
  // Leaving by another route (nav bar, back gesture) still logs a neutral early exit, without redirecting.
  addEventListener('hashchange', () => {
    if (ended) return;
    ended = true; cancelAll();
    logSession({ tool, mode, opener, startedAt, completed: false, exitedEarly: true });
  }, { once: true });
  const info = view.querySelector('#info');
  if (info) info.onclick = () => {
    const slot = view.querySelector('#cautionSlot');
    slot.innerHTML = slot.innerHTML ? '' : `<div class="notice" role="note">${esc(t('safety.' + tool.caution))}</div>`;
  };
  if (dur) later(() => finish(true), dur * 1000);
  mount?.({ po, stage: view.querySelector('#stage'), isEnded: () => ended, finish, setHint: (h) => { msg.textContent = h; } });
}

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'notice';
  el.setAttribute('role', 'status');
  el.style.cssText = 'position:fixed;left:1rem;right:1rem;bottom:150px;z-index:30;';
  el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.remove(), 3000);
}

/**
 * A content screen (lists, forms). One "Back" button is the way out. Leaving is a neutral,
 * completed visit: there is nothing to finish, so it is never counted as an early exit.
 */
export function runContent(view, tool, mode, opener, { body, mount, title = tool.name, intro = '' }) {
  cancelAll();
  const startedAt = Date.now();
  let logged = false;
  const log = () => { if (logged) return; logged = true; logSession({ tool, mode, opener, startedAt, completed: true, exitedEarly: false }); };
  view.innerHTML = `<h1>${esc(title)}</h1>${intro ? `<p class="muted">${esc(intro)}</p>` : ''}
    <div id="content">${body}</div>
    <div class="stopbar stack"><button class="primary" id="leave">${esc(t('common.back'))}</button></div>`;
  view.querySelector('#leave').onclick = () => { log(); go(backTo(mode)); };
  addEventListener('hashchange', log, { once: true });
  mount?.(view.querySelector('#content'), view);
}
