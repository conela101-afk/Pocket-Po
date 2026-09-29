// Writes COPY-REVIEW.md: every word the user reads, grouped by screen, for the owner's final copy edit.
// Run:  npm run copy      (edit data/copy.json or data/tools.json, then run it again)
import { readFileSync, writeFileSync } from 'node:fs';

const copy = JSON.parse(readFileSync('data/copy.json', 'utf8'));
const { tools, categories } = JSON.parse(readFileSync('data/tools.json', 'utf8'));
const defaults = JSON.parse(readFileSync('data/defaults.json', 'utf8'));
const tags = JSON.parse(readFileSync('data/tags.json', 'utf8'));

const flat = (o, pre = '') => Object.entries(o).flatMap(([k, v]) =>
  Array.isArray(v) ? [[pre + k, v.join(' · ')]] : v && typeof v === 'object' ? flat(v, pre + k + '.') : [[pre + k, String(v)]]);
const table = (rows) => '| Where | Wording |\n|---|---|\n' + rows.map(([k, v]) => `| \`${k}\` | ${v.replace(/\|/g, '\\|').replace(/\n/g, ' ')} |`).join('\n');
const FIXED = ['safety.cold', 'safety.crisis', 'export.footer'];

const out = [`# Copy review

Every word the user reads, in one place, for your final edit. Nothing here is personal: it is the app's own wording.

**How to use it:** read through, and change anything that does not sound right. Either tell Claude the change, or edit \`data/copy.json\` (screen wording) or \`data/tools.json\` (tool names and instructions) directly. \`npm run copy\` rebuilds this file, and \`npm run check\` tests the tone rules.

**Tone rules to read against:** plain, short, warm; invitation wording ("If you like", "You could", "One option:"); no exclamation marks, no clinical words, no slogans; Irish or British spelling; nothing that tells you how you feel.

**Fixed wording (not for editing):** the cool-water caution, the crisis footer and the export footer are set by \`SPEC.md\` and are marked *fixed* below.
`];

const groups = {};
for (const [k, v] of flat(copy)) { const g = k.split('.')[0]; (groups[g] ||= []).push([k, v]); }
const NAMES = { app: 'App', nav: 'Bottom bar', home: 'Home', now: 'Now', build: 'Build', library: 'Library', more: 'More', tool: 'Tool screens', breathe: 'Breathing tools', setup: 'First-run setup', settings: 'Settings', tags: 'Tag editor', after: 'Optional row after a tool', lists: 'Lists (evidence, parking lot, prep, notes)', plans: 'If-then plans', nameIt: 'Name it', pros: 'Pros and cons', stims: 'Stims', handoffTool: 'Handoff tool', handoff: 'Handoff', play: 'Absorb games', checklist: 'Tick lists', common: 'Common buttons', export: 'Export and reports', safety: 'Safety', a11y: 'Screen-reader labels', app2: '' };
for (const [g, rows] of Object.entries(groups)) {
  out.push(`\n## ${NAMES[g] || g}\n`);
  out.push(table(rows.map(([k, v]) => [k, FIXED.includes(k) ? `*fixed* ${v}` : v])));
}

out.push('\n## Now cards and Home\n');
out.push(table([...Object.entries(defaults.nowCards).map(([id, c]) => [`nowCards.${id}`, c.label]),
  ['defaults.handoffMessage', defaults.defaults.handoffMessage]]));

out.push('\n## Tags\n');
out.push(table(Object.entries(tags).map(([g, v]) => [`tags.${g}`, v.tags.join(' · ')])));

out.push('\n## Tools\n');
for (const c of categories) {
  const list = tools.filter((x) => x.category === c.id);
  if (!list.length) continue;
  out.push(`\n### ${c.name}\n`);
  for (const t of list) {
    out.push(`**${t.name}** (\`${t.id}\`)  \n${t.prompt}`);
    if (t.steps) out.push(t.steps.map((s, i) => `${i + 1}. ${s}`).join('\n'));
    out.push('');
  }
}
writeFileSync('COPY-REVIEW.md', out.join('\n') + '\n');
console.log('COPY-REVIEW.md written');
