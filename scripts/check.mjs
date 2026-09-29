// npm run check — whole-repo consistency checks. No dependencies.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const read = (p) => readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const errors = [];
const fail = (m) => errors.push(m);

const toolsData = json('data/tools.json');
const copy = json('data/copy.json');
const tags = json('data/tags.json');
const defaults = json('data/defaults.json');
const ids = new Set(toolsData.tools.map((x) => x.id));
const cats = new Set(toolsData.categories.map((c) => c.id));

// Tool table integrity
if (ids.size !== toolsData.tools.length) fail('tools.json: duplicate tool ids');
for (const x of toolsData.tools) {
  if (!cats.has(x.category)) fail(`tools.json: ${x.id} has unknown category ${x.category}`);
  if (x.caution && !(x.caution in copy.safety)) fail(`tools.json: ${x.id} caution key missing in copy.safety`);
  if (!x.modes?.length || !x.prompt) fail(`tools.json: ${x.id} missing modes or prompt`);
}

// Every tool has a screen type, and the data it needs
const RUN = new Set(['breathing', 'cool', 'pet', 'trace', 'quiet', 'guided', 'timed', 'checklist', 'pulse', 'bubbles', 'shapes', 'kaleido', 'list', 'plans', 'nameit', 'pros', 'handoff', 'stims']);
const runnersSrc = read('js/tools/run.js');
for (const x of toolsData.tools) {
  if (!RUN.has(x.run)) fail(`tools.json: ${x.id} has no valid run type`);
  else if (!new RegExp(`\\b${x.run}:`).test(runnersSrc)) fail(`run.js: no runner for type ${x.run}`);
  if (['guided', 'timed', 'checklist'].includes(x.run) && !x.steps?.length) fail(`tools.json: ${x.id} needs steps`);
  if (x.run === 'list' && !copy.lists?.[x.id]) fail(`copy.json: lists.${x.id} missing`);
  if (x.run === 'breathing' && !read('js/tools/breathe.js').includes(`'${x.pattern || x.id}'`) && !read('js/tools/breathe.js').includes(`${x.pattern || x.id}:`)) fail(`breathe.js: no pattern for ${x.id}`);
  if (x.category === 'build' && (x.modes.length !== 1 || x.modes[0] !== 'build')) fail(`tools.json: build tool ${x.id} must be build-only`);
  if (x.category !== 'build' && x.modes.includes('build')) fail(`tools.json: ${x.id} is not a Build tool (SPEC §5)`);
}

// Tool ids referenced elsewhere must exist
const refs = [
  ...defaults.defaults.now, ...Object.values(defaults.homeRotation).flat(), ...Object.keys(defaults.nowCards)
];
for (const id of refs) if (!ids.has(id)) fail(`defaults.json: unknown tool id ${id}`);
if (defaults.defaults.now.length > 3) fail('defaults.json: Now mode allows at most 3 cards');
for (const id of defaults.defaults.now) if (!(id in defaults.nowCards)) fail(`defaults.json: no Now card for ${id}`);
for (const [id, c] of Object.entries(defaults.nowCards)) {
  if (c.label.split(/\s+/).length > 6) fail(`Now card "${id}" has more than 6 words`);
}
for (const id of defaults.nowChoices) {
  if (!ids.has(id)) fail(`defaults.json: nowChoices has unknown tool id ${id}`);
  if (!(id in defaults.nowCards)) fail(`defaults.json: no Now card for choice ${id}`);
}
for (const id of defaults.defaults.now) if (!defaults.nowChoices.includes(id)) fail(`defaults.json: default ${id} is not in nowChoices`);
if (!('quiet' in defaults.nowCards) || !ids.has('quiet')) fail('quiet tool or card missing');
for (const g of Object.values(tags)) if (!g.tags.length) fail('tags.json: empty tag group');

// Copy keys used in code must resolve
const walk = (d) => readdirSync(d).flatMap((f) => {
  if (['node_modules', '.git'].includes(f)) return [];
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const resolve = (k) => k.split('.').reduce((o, p) => (o == null ? o : o[p]), copy);
for (const f of walk('js')) {
  for (const m of read(f).matchAll(/\bt\('([a-zA-Z0-9_.]+)'\)/g)) {
    if (resolve(m[1]) == null) fail(`${f}: copy key not found: ${m[1]}`);
  }
  for (const m of read(f).matchAll(/\bt\('([a-zA-Z0-9_.]+)' \+/g)) void m; // dynamic keys checked below
}
for (const k of ['home', 'now', 'build', 'library', 'more']) if (!copy.nav[k]) fail(`copy.nav.${k} missing`);

// Fixed safety copy must be present verbatim (SPEC §11)
const COLD = 'Cold on the face can slow your heart rate. Skip it if you have a heart condition, take medication that affects heart rate, tend to faint, or have a skin condition on your face. Use cool water or a wrapped ice pack, never ice directly on skin, never hold your breath or submerge your head. If unsure, check with your GP. Stop if you feel dizzy or unwell.';
const CRISIS = "If you're in crisis or need someone now: Samaritans 116 123 (free, 24/7) · Pieta 1800 247 247 · Emergency 999 or 112";
if (copy.safety.cold !== COLD) fail('copy.safety.cold differs from SPEC §11');
if (copy.safety.crisis !== CRISIS) fail('copy.safety.crisis differs from SPEC §11');
const FOOTER = read('SPEC.md').split('\n').find((l) => l.startsWith('> This summary is self-collected')).slice(2);
if (copy.export.footer !== FOOTER) fail('copy.export.footer differs from SPEC §9');
if ((read('js/export.js').match(/export\.footer/g) || []).length < 1) fail('export.js does not print the fixed footer');
const screens = read('js/screens.js');
if ((screens.match(/\$\{crisis\(\)\}/g) || []).length < 2) fail('crisis footer must render on Now and More');

// Banned phrases in user-facing copy
const banned = read('data/banned-phrases.txt').split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
const userText = [read('data/copy.json'), read('data/tools.json'), read('data/defaults.json'), read('data/tags.json')].join('\n').toLowerCase();
for (const b of banned) if (userText.includes(b)) fail(`banned phrase in data files: "${b}"`);

// No network calls or third-party scripts at runtime
for (const f of [...walk('js'), 'index.html', 'service-worker.js', ...walk('css')]) {
  const s = read(f);
  if (/https?:\/\/(?!www\.w3\.org)/.test(s.replace(/\/\/ .*$/gm, ''))) fail(`${f}: external URL found`);
  if (/\b(XMLHttpRequest|WebSocket|sendBeacon)\b/.test(s)) fail(`${f}: network API used`);
}

// Service worker shell lists real files
const sw = read('service-worker.js');
const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
for (const p of shell) if (p !== './' && !existsSync(p)) fail(`service-worker.js: missing file ${p}`);
const appFiles = [...walk('js'), ...walk('css'), ...walk('assets'), 'data/tools.json', 'data/tags.json', 'data/copy.json', 'data/defaults.json', 'manifest.webmanifest', 'index.html'];
for (const f of appFiles) if (!shell.includes(f.replace(/\\/g, '/'))) fail(`service-worker.js: ${f} not precached`);
if (/skipWaiting|clients\.claim/.test(sw.replace(/\/\/.*$/gm, ''))) fail('service-worker.js: must not force-activate (updates apply next launch)');

// Content rules: no pain or shock techniques, no condition names in user-facing copy
const forbidden = ['snap', 'rubber band', 'sour', 'hold ice', 'holding ice', 'ice cube', 'feel something', 'fast ', 'fasting', 'adhd', 'autis', 'depress', 'anxiety', 'ptsd', 'borderline', 'bipolar', 'diagnos'];
const scanText = [read('data/copy.json'), read('data/tools.json'), read('data/defaults.json'), read('data/tags.json')].join('\n').toLowerCase()
  .replace(copy.safety.cold.toLowerCase(), '').replace(copy.export.footer.toLowerCase(), '');
for (const w of forbidden) if (scanText.includes(w)) fail(`content rule: "${w.trim()}" found in user-facing data`);

// Personal terms (local, untracked file)
if (existsSync('data/banned-personal-terms.txt')) {
  const terms = read('data/banned-personal-terms.txt').split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
  const tracked = execSync('git ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
  for (const f of tracked) {
    let s; try { s = read(f).toLowerCase(); } catch { continue; }
    for (const term of terms) if (s.includes(term)) fail(`personal term matched in ${f}`);
  }
}

// ---- Cross-references between SPEC.md, CLAUDE.md, the data files and the repo ----
const spec = read('SPEC.md'), claude = read('CLAUDE.md');

// Every tool in tools.json is named in SPEC.md (Quiet is described in §3 without an id)
for (const id of ids) if (id !== 'quiet' && !spec.includes('`' + id + '`')) fail(`SPEC.md: tool id \`${id}\` is not mentioned`);
// Every id in SPEC.md §4 and §5 is a real tool
const s45 = spec.slice(spec.indexOf('## 4.'), spec.indexOf('## 6.'));
const NOT_TOOLS = new Set(['id', 'name', 'category', 'durationOptions', 'modes', 'prompt copy', 'caution', 'flags', 'optional', 'avoidsInteroception', 'now', 'build', 'library']);
for (const m of s45.matchAll(/`([a-z0-9-]+)`/g)) if (!NOT_TOOLS.has(m[1]) && !ids.has(m[1])) fail(`SPEC.md §4-5 names \`${m[1]}\` but tools.json has no such tool`);
// SPEC §5 Build list matches the Build tools
const buildSpec = [...spec.slice(spec.indexOf('## 5.'), spec.indexOf('## 6.')).matchAll(/`(build-[a-z0-9-]+)`/g)].map((m) => m[1]);
const buildTools = toolsData.tools.filter((x) => x.category === 'build').map((x) => x.id);
if ([...buildSpec].sort().join() !== [...buildTools].sort().join()) fail(`Build tools differ: SPEC has ${buildSpec.length}, tools.json has ${buildTools.length}`);
// Po states and frame counts match SPEC §10
const sheet = json('assets/po/po-sheet.json');
for (const m of spec.matchAll(/^\| `([a-z-]+)` \| (\d+) \|/gm)) {
  const st = sheet.states[m[1]];
  if (!st) fail(`po-sheet.json: state ${m[1]} from SPEC §10 is missing`);
  else if (st.frames !== +m[2]) fail(`po-sheet.json: ${m[1]} has ${st.frames} frames, SPEC says ${m[2]}`);
}
// Default tags in tags.json match SPEC §7
for (const [g, label] of [['trigger', 'Trigger'], ['context', 'Context']]) {
  const line = spec.split('\n').find((l) => l.startsWith(`- **${label}:**`)) || '';
  const want = line.replace(/^- \*\*\w+:\*\* /, '').split(' · ');
  if (want.join('|') !== tags[g].tags.join('|')) fail(`tags.json ${g} tags differ from SPEC §7`);
}
// Time blocks in SPEC §7 exist in db.js
for (const b of ['earlyMorning', 'morning', 'afternoon', 'evening', 'night']) if (!read('js/db.js').includes(`'${b}'`)) fail(`db.js: time block ${b} missing`);
// Files named in the CLAUDE.md repo layout exist
const layoutText = claude.match(/## Repo layout\s+```\n([\s\S]*?)```/)[1];
const layout = layoutText.replace(/,\n\s+/g, ', ').split('\n').filter(Boolean);
for (const f of readdirSync('js').filter((x) => x.endsWith('.js'))) if (!layoutText.includes(f)) fail(`CLAUDE.md layout does not list js/${f}`);
for (const f of readdirSync('scripts')) if (!layoutText.includes(f)) fail(`CLAUDE.md layout does not list scripts/${f}`);
for (const line of layout) {
  const dir = line.match(/^\/(\S+?)\/\s+(.+)$/);
  if (dir) {
    for (const f of dir[2].replace(/\(.*?\)/g, '').split(',').map((x) => x.trim()).filter(Boolean)) {
      if (f.includes('*')) continue;
      const full = f.includes('/') ? f : join(dir[1], f);
      for (const name of full.split(/\s*\+\s*/)) if (!existsSync(name.split(' ')[0])) fail(`CLAUDE.md layout lists ${dir[1]}/${f} but it does not exist`);
    }
  } else for (const f of line.split(/\s{2,}/).map((x) => x.trim().replace(/^\//, '')).filter(Boolean)) if (!existsSync(f) && !existsSync(f.split(' ')[0])) fail(`CLAUDE.md layout lists ${f} but it does not exist`);
}
// Copy keys nobody uses (a note, not a failure)
const allJs = walk('js').map(read).join('\n');
const flat = (o, pre = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, pre + k + '.') : [pre + k]));
const dynamicPrefixes = ['export.', 'breathe.', 'safety.', 'more.items.', 'after.', 'play.', 'setup.', 'lists.', 'nameIt.', 'stims.', 'nav.'];
const unused = flat(copy).filter((k) => !allJs.includes(`'${k}'`) && !dynamicPrefixes.some((p) => k.startsWith(p)) && !allJs.includes(k.split('.').slice(0, -1).join('.') + "'"));
if (unused.length) console.log('note: copy keys not referenced in code: ' + unused.join(', '));

// ---- Milestone 7: quality bar ----
// Size: everything the app ships stays under 2 MB, with no runtime dependencies
const shipped = shell.filter((f) => f !== './');
const bytes = shipped.reduce((n, f) => n + statSync(f).size, 0);
if (bytes > 2 * 1024 * 1024) fail(`app size is ${(bytes / 1048576).toFixed(2)} MB, over the 2 MB limit`);
if (existsSync('package.json') && (json('package.json').dependencies || {}) && Object.keys(json('package.json').dependencies || {}).length) fail('package.json: runtime dependencies are not allowed');

// Manifest and icons
const man = json('manifest.webmanifest');
if (man.display !== 'standalone') fail('manifest: display must be standalone');
for (const k of ['start_url', 'scope']) if (!man[k] || man[k].startsWith('/') || man[k].includes('://')) fail(`manifest: ${k} must be relative`);
if (!man.shortcuts?.some((x) => x.url.endsWith('#/now'))) fail('manifest: missing the Now shortcut');
const png = (f) => { const b = readFileSync(f); return b.toString('latin1', 1, 4) === 'PNG' ? [b.readUInt32BE(16), b.readUInt32BE(20)] : null; };
for (const ic of man.icons) {
  const [w, h] = (ic.sizes || '').split('x').map(Number);
  if (!existsSync(ic.src)) { fail(`manifest: icon ${ic.src} is missing`); continue; }
  const got = png(ic.src);
  if (!got || got[0] !== w || got[1] !== h) fail(`manifest: icon ${ic.src} is not ${ic.sizes}`);
}
for (const need of [192, 512]) if (!man.icons.some((x) => x.sizes === `${need}x${need}` && x.purpose !== 'maskable')) fail(`manifest: missing a ${need}px icon`);
if (!man.icons.some((x) => x.purpose === 'maskable')) fail('manifest: missing a maskable icon');
const page = read('index.html');
if (!/<html[^>]*lang="en-IE"/.test(page)) fail('index.html: lang should be en-IE');
if (!/viewport-fit=cover/.test(page)) fail('index.html: viewport-fit=cover is missing');
if (!/apple-touch-icon/.test(page)) fail('index.html: apple-touch-icon is missing');
if (!/Content-Security-Policy/.test(page) || !/default-src 'self'/.test(page) || !/connect-src 'self'/.test(page)) fail('index.html: Content-Security-Policy must limit everything to the app itself');

// Copy and tone in everything the user reads
const readable = [['data/copy.json', read('data/copy.json')], ['data/tools.json', read('data/tools.json')], ['data/defaults.json', read('data/defaults.json')], ['data/tags.json', read('data/tags.json')], ['README.md', read('README.md')]];
const US = /\b(color|colors|favorite|favorites|organize|organized|behavior|gray|center|centered|neighbor|realize|recognize|program(?!me)|meter)\b/i;
for (const [f, txt] of readable) {
  const m = txt.match(US); if (m && !/^(README)/.test(f)) fail(`${f}: US spelling "${m[0]}" (use British/Irish spelling)`);
  if (f.endsWith('.json') && /!/.test(txt.replace(/"[^"]*":/g, ''))) fail(`${f}: exclamation mark in copy`);
}
// No emoji in tool instructions (Now card icons in defaults.json are the only exception)
if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(JSON.stringify(toolsData))) fail('tools.json: emoji in tool instructions');
// Banned phrases inside code strings too (comments are ignored)
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
for (const f of walk('js')) {
  const src = stripComments(read(f)).toLowerCase();
  for (const b of banned) if (src.includes(b)) fail(`${f}: banned phrase in code: "${b}"`);
}
// Hard-coded words in markup: labels come from copy.json (a few characters and symbols are fine)
for (const f of walk('js')) {
  const src = stripComments(read(f));
  for (const m of src.matchAll(/aria-label="([A-Za-z][^"$]*)"/g)) fail(`${f}: hard-coded aria-label "${m[1]}" (put it in copy.json)`);
}

if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); process.exit(1); }
console.log(`check passed: ${ids.size} tools, ${refs.length} references, copy and safety text verified`);
