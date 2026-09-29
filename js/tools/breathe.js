// Breathing tools: Po is the pacer (expands and contracts) with a soft ring. No counting needed.
import { t } from '../data.js';
import { getSetting, setSetting } from '../settings.js';
import { logSession } from '../db.js';
import { poHTML, setPo } from '../po.js';
import { go } from '../router.js';
import { showAfterRow, scaleHTML, wireScale } from './afterrow.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// kind: in | out | hold | topup. `to` is how full the ring is at the end of the phase.
const P = (kind, sec, to, label) => ({ kind, sec, to, label: label || kind });
export const PATTERNS = {
  box: [P('in', 4, 1), P('hold', 4, 1), P('out', 4, 0), P('hold', 4, 0)],
  'cyclic-sigh': [P('in', 3, 0.8), P('topup', 1.5, 1), P('out', 7, 0)],
  'paced-55': [P('in', 5.5, 1), P('out', 5.5, 0)],
  'ext-exhale': [P('in', 4, 1), P('out', 6, 0)],
  'hum-exhale': [P('in', 4, 1), P('out', 7, 0, 'hum')],
  'pursed-lip': [P('in', 2, 1), P('out', 4, 0)],
  478: [P('in', 4, 1), P('hold', 7, 1), P('out', 8, 0)]
};

/** Comfort mode: no holds, exhale no longer than the inhale. Just go at your pace. */
export function phasesFor(id, { noHolds = false, comfort = false } = {}) {
  let ph = PATTERNS[id].map((p) => ({ ...p }));
  if (noHolds || comfort) ph = ph.filter((p) => p.kind !== 'hold');
  if (comfort) {
    const inSec = ph.filter((p) => p.kind === 'in' || p.kind === 'topup').reduce((a, p) => a + p.sec, 0);
    ph.filter((p) => p.kind === 'out').forEach((p) => { p.sec = inSec; });
  }
  return ph;
}

let timers = [];
let audio = null;
const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
addEventListener('hashchange', clearTimers);

function cue(kind) {
  if (getSetting('vibration') && navigator.vibrate) navigator.vibrate(kind === 'hold' ? 0 : 25);
  if (getSetting('sound') && kind !== 'hold') {
    try {
      audio ||= new AudioContext();
      const o = audio.createOscillator(), g = audio.createGain(), now = audio.currentTime;
      o.frequency.value = kind === 'out' ? 165 : 220;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.04, now + 0.25);
      g.gain.linearRampToValueAtTime(0, now + 0.8);
      o.connect(g).connect(audio.destination);
      o.start(now); o.stop(now + 0.85);
    } catch { /* sound is optional */ }
  }
}

export function runBreathing(view, tool, mode, opener) {
  const back = mode === 'now' ? '/now' : '/home';
  const isNow = mode === 'now';
  const defaultDur = tool.durationOptions.includes(180) ? 180 : tool.durationOptions[0];
  const opts = { dur: defaultDur, noHolds: false };
  clearTimers();

  const setup = () => {
    view.innerHTML = `
      <div class="center">${poHTML('sit')}<h1>${esc(tool.name)}</h1><p>${esc(tool.prompt)}</p></div>
      <h2>${esc(t('breathe.length'))}</h2>
      <div class="chips">${tool.durationOptions.map((s) => `<button data-d="${s}" aria-pressed="${s === opts.dur}">${s / 60} min</button>`).join('')}</div>
      ${getSetting('afterRow') ? `<h2>${esc(t('after.before'))}</h2>${scaleHTML()}` : ''}
      <div style="margin-top:.75rem">
        ${tool.flags.includes('hasHoldVariant') ? `<label class="setting"><span>${esc(t('breathe.noHolds'))}</span><input type="checkbox" id="nh"></label>` : ''}
        <label class="setting"><span>${esc(t('breathe.comfort'))}</span><input type="checkbox" id="cf" ${getSetting('comfortExhale') ? 'checked' : ''}></label>
      </div>
      <div class="stopbar stack"><button class="primary" id="go">${esc(t('breathe.start'))}</button><a class="btn" href="#${back}">${esc(t('now.back'))}</a></div>`;
    view.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => {
      opts.dur = +b.dataset.d;
      view.querySelectorAll('[data-d]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    });
    view.querySelector('#nh')?.addEventListener('change', (e) => { opts.noHolds = e.target.checked; });
    view.querySelector('#cf').onchange = (e) => setSetting('comfortExhale', e.target.checked);
    wireScale(view, (n) => { opts.before = n; });
    view.querySelector('#go').onclick = run;
  };

  const run = () => {
    const phases = phasesFor(tool.pattern || tool.id, { noHolds: opts.noHolds, comfort: getSetting('comfortExhale') });
    const total = opts.dur * 1000;
    const startedAt = Date.now();
    const C = 2 * Math.PI * 114;
    view.innerHTML = `
      <h1 class="sr-only">${esc(tool.name)}</h1>
      <div class="pacer">
        <svg class="ring" viewBox="0 0 240 240" aria-hidden="true"><circle class="track" cx="120" cy="120" r="114"/>
          <circle class="fill" cx="120" cy="120" r="114" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
        ${poHTML('sit')}
      </div>
      <p class="phase" id="phase" aria-live="off"></p>
      <div class="stopbar stack"><button class="primary" id="stop">${esc(t('now.stop'))}</button></div>`;
    const po = view.querySelector('.po'), fill = view.querySelector('.fill'), label = view.querySelector('#phase');
    let i = 0, ended = false;

    const finish = async (completed) => {
      if (ended) return; ended = true; clearTimers();
      const rec = await logSession({ tool, mode, opener, startedAt, completed, exitedEarly: !completed, ratingBefore: opts.before ?? null });
      if (!completed) return go(back);
      setPo(po, 'yawn-settle', { dur: 3 });
      fill.style.transitionDuration = '2s'; fill.style.strokeDashoffset = C;
      label.textContent = t('breathe.settled');
      const bar = view.querySelector('.stopbar');
      bar.innerHTML = `<a class="btn primary" href="#${back}">${esc(t('now.back'))}</a>`;
      showAfterRow(bar, rec); // only after a tool ends by itself, never on Stop
    };
    view.querySelector('#stop').onclick = () => finish(false);
    addEventListener('hashchange', () => {  // leaving by another route: neutral early exit, no redirect
      if (ended) return;
      ended = true; clearTimers();
      logSession({ tool, mode, opener, startedAt, completed: false, exitedEarly: true, ratingBefore: opts.before ?? null });
    }, { once: true });

    const step = () => {
      if (ended) return;
      if (Date.now() - startedAt >= total && i % phases.length === 0) return finish(true);
      const p = phases[i % phases.length]; i++;
      label.textContent = t('breathe.' + p.label);
      fill.style.transitionDuration = `${p.sec}s`;
      fill.style.strokeDashoffset = C * (1 - p.to);
      if (p.kind === 'in') setPo(po, 'breathe-in', { dur: p.sec });
      if (p.kind === 'out') setPo(po, 'breathe-out', { dur: p.sec });
      cue(p.kind);
      timers.push(setTimeout(step, p.sec * 1000));
    };
    requestAnimationFrame(step);
  };

  // Now mode and plans skip the start screen: the choice was already made.
  if (isNow || opener === 'plan') run(); else setup();
}
