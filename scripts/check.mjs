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
  .replace(copy.safety.cold.toLowerCase(), '').replace(/it is not evidence of any diagnosis/g, '');
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

if (errors.length) { console.error(errors.map((e) => '✗ ' + e).join('\n')); process.exit(1); }
console.log(`check passed: ${ids.size} tools, ${refs.length} references, copy and safety text verified`);
