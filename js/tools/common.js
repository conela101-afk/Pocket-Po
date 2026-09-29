// Shared helpers for tool screens: timers that clean up on leaving, and a soft-ended session shell.
import { t } from '../data.js';
import { logSession } from '../db.js';
import { poHTML, setPo } from '../po.js';
import { go } from '../router.js';

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
 * `mount({ po, stage, isEnded })` wires up the tool's own interaction.
 */
export function runSession(view, tool, mode, opener, { dur, poState = 'sit', poSize = '', stage = '', hint = '', endMessage, mount }) {
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
    await logSession({ tool, mode, opener, startedAt, completed, exitedEarly: !completed });
    if (!completed) go(backTo(mode));
  };
  view.querySelector('#stop').onclick = () => finish(false);
  const info = view.querySelector('#info');
  if (info) info.onclick = () => {
    const slot = view.querySelector('#cautionSlot');
    slot.innerHTML = slot.innerHTML ? '' : `<div class="notice" role="note">${esc(t('safety.' + tool.caution))}</div>`;
  };
  later(() => finish(true), dur * 1000);
  mount?.({ po, stage: view.querySelector('#stage'), isEnded: () => ended });
}
