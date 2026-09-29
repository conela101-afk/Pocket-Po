// Po's corner on Home. Cosmetic items unlock with cumulative use (25, 75, 150, 300, 500, 800 sessions)
// and stay unlocked for good: the count only ever goes up, and deleting sessions never removes anything.
// Nothing is announced. An item is simply there the next time Home is shown.
import { get, put, getAll } from './db.js';

export const UNLOCKS = [
  { id: 'cushion', at: 25 }, { id: 'scarf', at: 75 }, { id: 'perch', at: 150 },
  { id: 'plant', at: 300 }, { id: 'blanket', at: 500 }, { id: 'fishbowl', at: 800 }
];

const PAL = {
  a: '#4a2a14', b: '#6f8fb0', c: '#a9c1d8', g: '#5f8a4f', h: '#3f6a3a', p: '#b8683a', q: '#8a4a26', w: '#8a6a4a',
  s: '#a8d0e6', r: '#b04a4a', y: '#e0b84a', f: '#e07a3a', u: '#9fd0e0', k: '#6a8a98', l: '#a58ab8', m: '#cdb8dc'
};

// 16-wide pixel maps, original art. '.' is empty.
const ART = {
  cushion: ['................', '..aaaaaaaaaaaa..', '.abbbbbbbbbbbba.', 'abbccbbbbbbccbba', '.abbbbbbbbbbbba.', '..aaaaaaaaaaaa..'],
  scarf: ['..aaaaaaaaaa....', '.arrrrrrrrrra...', '.aryrryrryrra...', '..aaaaaaaaaa....', '...arra.arra....', '...aryra.aryra..', '...arrra.arrra..', '....aaa...aaa...'],
  perch: ['..aaaaaaaaaaaa..', '.awwwwwwwwwwwwa.', '.awssssswsssssa.', '.awssssswsssssa.', '.awssssswsssssa.', '.awwwwwwwwwwwwa.', '.awssssswsssssa.', '.awssssswsssssa.', '.awwwwwwwwwwwwa.', 'aaaaaaaaaaaaaaaa', 'awwwwwwwwwwwwwwa', 'aaaaaaaaaaaaaaaa'],
  plant: ['.....g..h.g.....', '....ggg.hggg....', '...gggghgggg....', '....ggghggg.....', '.....gghgg......', '......ghg.......', '....aaaaaaaa....', '...appppppppa...', '...apppqqpppa...', '....apppppppa...', '....appppppa....', '.....aaaaaaa....'],
  blanket: ['................', '..aaaaaaaaaaaa..', '.alllmmllmmllla.', '.amllllmmllllma.', '.alllmmllmmllla.', '.amllllmmllllma.', '..aaaaaaaaaaaa..'],
  fishbowl: ['...kkkkkkkkkk...', '..kuuuuuuuuuuk..', '.kuuuuufuuuuuuk.', '.kuuufffuuuuuuk.', '.kuuuufffuuuuuk.', '.kuuuuuuuuuuuuk.', '.kuuuuuuuuuuuuk.', '..kuuuuuuuuuuk..', '...kkkkkkkkkk...', '...aaaaaaaaaa...']
};

function svg(id) {
  const rows = ART[id];
  const rects = rows.flatMap((row, y) => [...row.padEnd(16, '.')].map((ch, x) => (ch === '.' ? '' : `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch]}"/>`))).join('');
  return `<svg class="item-art" viewBox="0 0 16 ${rows.length}" width="64" height="${rows.length * 4}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects}</svg>`;
}

export const unlockedIds = (count) => UNLOCKS.filter((u) => count >= u.at).map((u) => u.id);

/** The scene around Po. `poHtml` is Po's element. Decorative, so hidden from screen readers. */
export function sceneHTML(poHtml, count) {
  const have = new Set(unlockedIds(count));
  const at = (id) => (have.has(id) ? `<span class="scene-item ${id}">${svg(id)}</span>` : '');
  return `<div class="scene">
    <div class="scene-side left">${at('perch')}${at('scarf')}</div>
    <div class="scene-mid">${poHtml}${at('cushion')}</div>
    <div class="scene-side right">${at('plant')}${at('blanket')}${at('fishbowl')}</div>
  </div>`;
}

/** Cumulative count. It only rises: the larger of the stored count and the sessions still on the device. */
export async function cumulativeCount() {
  try {
    const st = (await get('poState', 'state')) || { id: 'state', count: 0 };
    const now = (await getAll('sessions')).filter((s) => !s.opened).length;
    if (now > st.count) { st.count = now; await put('poState', st); }
    return st.count;
  } catch { return 0; }
}
