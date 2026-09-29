// The optional row after a tool ends. Everything in it is skippable; nothing is asked twice.
// It fades away by itself after about 8 seconds unless the user starts using it, and every choice
// is saved as it is made. The app never reads or interprets the note.
import { t } from '../data.js';
import { getSetting } from '../settings.js';
import { put } from '../db.js';
import { offeredTags } from '../tags.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FADE_AFTER_MS = 8000;

/** Five buttons, left to right. Fuller circle = louder. Position, fill and number all carry the meaning, not just colour. */
export function scaleHTML(selected = null) {
  const pie = (n) => {
    if (n === 5) return '<circle cx="16" cy="16" r="12" class="fillc"/>';
    const a = (n / 5) * 2 * Math.PI, x = 16 + 12 * Math.sin(a), y = 16 - 12 * Math.cos(a);
    return `<path class="fillc" d="M16 16 L16 4 A12 12 0 ${n > 2.5 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z"/>`;
  };
  return `<div class="scale" role="group" aria-label="${esc(t('after.scale'))}">
    ${[1, 2, 3, 4, 5].map((n) => `<button data-n="${n}" class="s${n}" aria-pressed="${selected === n}" aria-label="${n} of 5">
      <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" class="ring"/>${pie(n)}</svg><span aria-hidden="true">${n}</span></button>`).join('')}
    </div><div class="scale-ends muted" aria-hidden="true"><span>${esc(t('after.lo'))}</span><span>${esc(t('after.hi'))}</span></div>`;
}

/** Wires a scale: onPick(n | null). Tapping the chosen button again clears it. */
export function wireScale(root, onPick) {
  root.querySelectorAll('.scale [data-n]').forEach((b) => b.onclick = () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    root.querySelectorAll('.scale [data-n]').forEach((x) => x.setAttribute('aria-pressed', false));
    b.setAttribute('aria-pressed', on);
    onPick(on ? +b.dataset.n : null);
  });
}

/** Shows the row just before `anchor`. `rec` is the session that was just logged. */
export async function showAfterRow(anchor, rec) {
  if (!rec || !getSetting('afterRow') || !anchor?.isConnected) return;
  const groups = ['trigger', 'context', ...(getSetting('bodyTags') ? ['body'] : [])];
  const offered = {};
  for (const g of groups) offered[g] = await offeredTags(g);
  if (!anchor.isConnected) return;

  const field = { trigger: 'triggers', context: 'context', body: 'body' };
  const el = document.createElement('section');
  el.className = 'afterrow';
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', t('after.lead'));
  el.innerHTML = `<p class="muted">${esc(t('after.lead'))}</p>${scaleHTML(rec.ratingAfter)}
    <div class="chips helped">${['helped', 'neutral', 'didnt'].map((k) => `<button data-h="${k}" aria-pressed="${rec.helped === k}">${esc(t('after.' + k))}</button>`).join('')}</div>
    ${groups.map((g) => `<h2>${esc(t('after.groups.' + g))}</h2><div class="chips" data-g="${g}">${offered[g].map((l) => `<button data-l="${esc(l)}" aria-pressed="${rec[field[g]].includes(l)}">${esc(l)}</button>`).join('')}</div>`).join('')}
    <label class="field"><span>${esc(t('after.note'))}</span><textarea id="afternote" maxlength="2000">${esc(rec.note || '')}</textarea></label>`;
  anchor.before(el);

  const save = () => put('sessions', rec).catch(() => null);
  wireScale(el, (n) => { rec.ratingAfter = n; save(); });
  el.querySelectorAll('[data-h]').forEach((b) => b.onclick = () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    el.querySelectorAll('[data-h]').forEach((x) => x.setAttribute('aria-pressed', false));
    b.setAttribute('aria-pressed', on);
    rec.helped = on ? b.dataset.h : null; save();
  });
  el.querySelectorAll('[data-g]').forEach((box) => box.querySelectorAll('[data-l]').forEach((b) => b.onclick = () => {
    const on = b.getAttribute('aria-pressed') !== 'true', list = rec[field[box.dataset.g]];
    b.setAttribute('aria-pressed', on);
    const i = list.indexOf(b.dataset.l);
    if (on && i < 0) list.push(b.dataset.l); if (!on && i >= 0) list.splice(i, 1);
    save();
  }));
  let noteTimer;
  el.querySelector('#afternote').oninput = (e) => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { rec.note = e.target.value.trim() || null; save(); }, 400);
  };
  el.querySelector('#afternote').onblur = (e) => { clearTimeout(noteTimer); rec.note = e.target.value.trim() || null; save(); };

  // Fades by itself. Any touch, key or focus inside keeps it until the user leaves.
  let fadeTimer, removeTimer;
  const fade = () => {
    el.classList.add('fading');
    removeTimer = setTimeout(() => el.remove(), document.documentElement.dataset.motion === 'reduce' ? 0 : 1600);
  };
  fadeTimer = setTimeout(fade, FADE_AFTER_MS);
  const keep = () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); el.classList.remove('fading'); };
  ['pointerdown', 'focusin', 'keydown', 'input'].forEach((ev) => el.addEventListener(ev, keep));
  addEventListener('hashchange', () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); }, { once: true });
}
