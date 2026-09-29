// Absorb tools: repetitive and soothing, with a soft end at about 3 minutes.
// No score, no progress. At the end Po yawns and settles, and the tool stops accepting input.
import { t } from '../data.js';
import { getSetting } from '../settings.js';
import { setPo } from '../po.js';
import { runSession, every } from './common.js';

const SOFT_END_SEC = 180;

export function runPetPo(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    dur: SOFT_END_SEC, poState: 'sit', poSize: 'lg', hint: t('tool.petHint'),
    mount({ po, isEnded }) {
      let state = 'sit', lastTouch = 0, down = false, lastBuzz = 0;
      const to = (s) => { if (s !== state) { state = s; setPo(po, s); } };
      const touch = () => {
        if (isEnded()) return;
        lastTouch = Date.now(); to('purr');
        if (getSetting('vibration') && navigator.vibrate && lastTouch - lastBuzz > 500) { lastBuzz = lastTouch; navigator.vibrate(8); }
      };
      po.style.touchAction = 'none';
      po.addEventListener('pointerdown', () => { down = true; touch(); });
      po.addEventListener('pointermove', () => { if (down) touch(); });
      addEventListener('pointerup', () => { down = false; });
      every(() => { if (!isEnded() && state === 'purr' && Date.now() - lastTouch > 900) to('sit'); }, 300);
    }
  });
}

export function runPatternTrace(view, tool, mode, opener) {
  const W = 300;
  runSession(view, tool, mode, opener, {
    dur: SOFT_END_SEC, poSize: 'sm', hint: t('tool.traceHint'),
    stage: `<svg id="trace" class="trace" viewBox="0 0 ${W} ${W}" role="img" aria-label="${t('tool.traceHint')}">
      <path class="guide" d="M20 150 C 70 40, 110 260, 150 150 S 230 40, 280 150"/><path class="trail" d=""/></svg>`,
    mount({ stage, isEnded }) {
      const svg = stage.querySelector('#trace'), trail = svg.querySelector('.trail');
      let pts = [], down = false;
      const pos = (e) => { const r = svg.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * W]; };
      const draw = () => { trail.setAttribute('d', pts.map((p, i) => `${p.brk || i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')); };
      svg.addEventListener('pointerdown', (e) => { if (isEnded()) return; down = true; svg.setPointerCapture(e.pointerId); const [x, y] = pos(e); pts.push({ x, y, t: Date.now(), brk: true }); draw(); });
      svg.addEventListener('pointermove', (e) => { if (!down || isEnded()) return; const [x, y] = pos(e); pts.push({ x, y, t: Date.now() }); draw(); });
      const up = () => { down = false; };
      svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
      every(() => { const cut = Date.now() - 2500; pts = pts.filter((p) => p.t > cut); if (pts.length) pts[0].brk = true; draw(); }, 200);
    }
  });
}
