// WCAG contrast for the colour tokens in css/themes.css. Run by `npm run check`.
import { readFileSync } from 'node:fs';

const css = readFileSync('css/themes.css', 'utf8');
const tokens = (block) => Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const blockAfter = (marker) => { const i = css.indexOf(marker); return css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i)); };

const light = tokens(blockAfter(':root {'));
const dark = tokens(blockAfter(':root[data-theme="dark"] {'));
const hi = tokens(blockAfter(':root[data-contrast="high"] {'));
const hiDark = tokens(blockAfter(':root[data-contrast="high"][data-theme="dark"] {'));
const palettes = {
  light, dark,
  'light + high contrast': { ...light, ...hi },
  'dark + high contrast': { ...dark, ...hiDark }
};

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// [foreground, background, minimum, what it is]
const PAIRS = [
  ['text', 'bg', 4.5, 'body text'], ['text', 'surface', 4.5, 'text on cards'], ['text', 'surface-2', 4.5, 'text on pressed'],
  ['muted', 'bg', 4.5, 'quiet text'], ['muted', 'surface', 4.5, 'quiet text on cards'], ['muted', 'surface-2', 4.5, 'quiet text on pressed'],
  ['accent-text', 'accent', 4.5, 'text on main buttons'],
  ['accent', 'bg', 3, 'accent graphics (ring, bars)'], ['accent', 'surface', 3, 'accent graphics on cards'],
  ['field', 'bg', 3, 'input and checkbox edges'], ['field', 'surface', 3, 'input edges on cards'],
  ['focus', 'bg', 3, 'focus outline'], ['focus', 'surface', 3, 'focus outline on cards']
];

let failed = 0;
const rows = [];
for (const [name, p] of Object.entries(palettes)) {
  for (const [fg, bg, min, what] of PAIRS) {
    if (!p[fg] || !p[bg]) { console.error(`✗ contrast: ${name} is missing --${fg} or --${bg}`); failed++; continue; }
    const r = ratio(p[fg], p[bg]);
    rows.push(`${name.padEnd(22)} ${what.padEnd(30)} ${r.toFixed(2)} (min ${min})`);
    if (r < min) { console.error(`✗ contrast: ${name}: ${what} is ${r.toFixed(2)}, needs ${min}`); failed++; }
  }
}
if (process.argv.includes('--all')) console.log(rows.join('\n'));
if (failed) process.exit(1);
console.log(`contrast passed: ${Object.keys(palettes).length} palettes, ${PAIRS.length} pairs each`);
