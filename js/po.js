// Placeholder Po: a 16x16 pixel cat drawn as inline SVG. Real spritesheet comes in Milestone 2.
const px = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;

export function poHTML(state = 'sit', size = '') {
  const O = '#e08a3c', D = '#96541e', C = '#f6e2c4', E = '#28201a', P = '#e28c8c';
  const svg = [
    px(2, 2, 3, 4, O), px(11, 2, 3, 4, O), px(3, 3, 1, 2, P), px(12, 3, 1, 2, P),
    px(2, 5, 12, 9, O), px(5, 5, 1, 2, D), px(8, 5, 1, 2, D), px(11, 5, 1, 2, D),
    `<g class="eyes-open">${px(5, 8, 2, 2, E)}${px(9, 8, 2, 2, E)}${px(5, 8, 1, 1, C)}${px(9, 8, 1, 1, C)}</g>`,
    `<g class="eyes-closed">${px(5, 9, 2, 1, E)}${px(9, 9, 2, 1, E)}</g>`,
    px(6, 11, 4, 3, C), px(7, 11, 2, 1, P)
  ].join('');
  return `<div class="po ${size}" data-state="${state}" role="img" aria-label="Po, an orange cat"><svg viewBox="0 0 16 16">${svg}</svg></div>`;
}
