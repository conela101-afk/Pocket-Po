// Absorb games with a soft end at about 3 minutes. No score, no levels, no wrong answers that show up.
import { t } from '../data.js';
import { getSetting } from '../settings.js';
import { runSession, every, later, esc } from './common.js';

const SOFT_END_SEC = 180;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduced = () => document.documentElement.dataset.motion === 'reduce';

export function runBubbles(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    dur: SOFT_END_SEC, poSize: 'sm', hint: t('play.bubbles'),
    stage: '<div class="playfield" id="pf" role="group"></div>',
    mount({ stage, isEnded }) {
      const pf = stage.querySelector('#pf');
      every(() => {
        if (isEnded() || pf.children.length >= 6) return;
        const b = document.createElement('button');
        const size = rnd(60, 88);
        b.className = 'bubble'; b.setAttribute('aria-label', 'Bubble');
        b.style.cssText = `width:${size}px;height:${size}px;left:${rnd(2, 78)}%;` + (reduced() ? `top:${rnd(5, 70)}%;` : '');
        b.onclick = () => { if (getSetting('vibration') && navigator.vibrate) navigator.vibrate(6); b.remove(); };
        pf.append(b);
        later(() => b.remove(), 9500);
      }, 900);
    }
  });
}

const shapeSVG = (kind, fill) => {
  const f = fill ? 'var(--accent)' : 'none';
  const body = { circle: `<circle cx="50" cy="50" r="38"/>`, square: `<rect x="14" y="14" width="72" height="72" rx="6"/>`, triangle: `<path d="M50 12 L90 86 L10 86 Z" stroke-linejoin="round"/>` }[kind];
  return `<svg viewBox="0 0 100 100" fill="${f}" stroke="var(--text)" stroke-width="5" aria-hidden="true" width="${fill ? 96 : 44}" height="${fill ? 96 : 44}">${body}</svg>`;
};

export function runShapes(view, tool, mode, opener) {
  const kinds = ['circle', 'square', 'triangle'];
  runSession(view, tool, mode, opener, {
    dur: SOFT_END_SEC, poSize: 'sm', hint: t('play.shapes'),
    stage: `<div class="playfield" style="height:auto;padding-top:.5rem"><div class="shape-now" id="now" role="img"></div>
      <div class="bins">${kinds.map((k) => `<button data-k="${k}" aria-label="${esc(t('play.' + k))}">${shapeSVG(k, false)}<small>${esc(t('play.' + k))}</small></button>`).join('')}</div></div>`,
    mount({ stage, isEnded }) {
      let cur = pick(kinds);
      const now = stage.querySelector('#now');
      const show = () => { now.innerHTML = shapeSVG(cur, true); now.setAttribute('aria-label', t('play.' + cur)); };
      show();
      stage.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
        if (isEnded() || b.dataset.k !== cur) return; // a wrong tap simply does nothing
        cur = pick(kinds); show();
      });
    }
  });
}

const PALETTES = [['#c9762f', '#e0b070', '#7a5c3a'], ['#4f7f96', '#9cc3d5', '#33566a'], ['#7c8f5a', '#b9c98f', '#4c5c33'], ['#9a6a8a', '#d0a6c4', '#6a4260']];

export function runKaleidoscope(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    dur: SOFT_END_SEC, poSize: 'sm', hint: t('play.kaleido'),
    stage: '<svg id="k" class="kaleido" viewBox="0 0 300 300" role="img" aria-label="Kaleidoscope"></svg>',
    mount({ stage, isEnded }) {
      const svg = stage.querySelector('#k');
      const make = () => {
        const pal = pick(PALETTES);
        const bits = Array.from({ length: 5 }, () => {
          const c = pick(pal), x = rnd(150, 170), y = rnd(30, 130), r = rnd(6, 24);
          return pick([`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`, `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r / 2}" fill="${c}" opacity=".85"/>`, `<path d="M${x} ${y - r} L${x + r} ${y + r} L${x - r} ${y + r} Z" fill="${c}" opacity=".9"/>`]);
        }).join('');
        const slices = Array.from({ length: 8 }, (_, k) => `<g transform="translate(150 150) rotate(${k * 45}) scale(${k % 2 ? -1 : 1} 1) translate(-150 -150)">${bits}</g>`).join('');
        svg.innerHTML = `<circle cx="150" cy="150" r="150" fill="var(--surface)"/><g class="spin">${slices}</g>`;
      };
      make();
      svg.onclick = () => { if (!isEnded()) make(); };
    }
  });
}
