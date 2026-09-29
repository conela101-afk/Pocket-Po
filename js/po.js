// Po: CSS steps() animation over the spritesheet. Frame map comes from assets/po/po-sheet.json.
let map = null;

export async function loadPo() {
  map = await fetch('assets/po/po-sheet.json').then((r) => r.json());
}

const ONCE = new Set(['breathe-in', 'breathe-out', 'yawn-settle', 'stretch']);
const SLOW = { 'idle-loaf': 2.4, sit: 2.4, sleep: 4, purr: 1.2, walk: 0.8, wash: 2.4, 'watch-bird': 2.4, stretch: 3 };

/** Applies a state to a .po element. opts.dur (seconds) sets the length of a one-shot state. */
export function setPo(el, state, opts = {}) {
  const s = map?.states[state] || map?.states.sit;
  const once = ONCE.has(state);
  el.dataset.state = state;
  el.classList.toggle('once', once);
  el.style.setProperty('--row', s.row);
  el.style.setProperty('--n', s.frames);
  // Static pose for reduced motion: the end pose of one-shots, the first frame otherwise.
  el.style.setProperty('--rest', once ? s.frames - 1 : 0);
  el.style.setProperty('--dur', `${opts.dur ?? SLOW[state] ?? 2}s`);
  const sprite = el.firstElementChild;
  sprite.style.animation = 'none';
  void sprite.offsetWidth; // restart the animation
  sprite.style.animation = '';
}

export function poHTML(state = 'sit', size = '') {
  const s = map?.states[state] || map?.states.sit;
  const once = ONCE.has(state);
  return `<div class="po ${size} ${once ? 'once' : ''}" data-state="${state}" role="img" aria-label="Po, an orange cat"
    style="--row:${s.row};--n:${s.frames};--rest:${once ? s.frames - 1 : 0};--dur:${SLOW[state] ?? 2}s"><div class="po-sprite"></div></div>`;
}
