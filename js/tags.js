// Tags: defaults live in data/tags.json. The user's edits (renames, hidden, added) live in the
// tagsConfig store as a small overlay, so future default tags still appear. "Not sure" is fixed.
import { t, getTags } from './data.js';
import { getSetting, setSetting } from './settings.js';
import { put, get, getAll } from './db.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const GROUPS = ['trigger', 'context', 'body'];
const DOC = 'config';
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const blank = () => ({ id: DOC, renames: {}, hidden: {}, custom: { trigger: [], context: [], body: [] } });

export async function loadConfig() {
  const c = await get('tagsConfig', DOC).catch(() => null);
  return { ...blank(), ...(c || {}), custom: { ...blank().custom, ...(c?.custom || {}) } };
}
const saveConfig = (c) => put('tagsConfig', c).catch(() => null);

/** Every editable tag in a group: defaults first, then the user's own. "Not sure" is not in this list. */
export function groupTags(cfg, group) {
  const defs = getTags()[group].tags.filter((x) => x !== 'Not sure').map((label) => ({ id: slug(label), label, custom: false }));
  return [...defs, ...cfg.custom[group].map((x) => ({ ...x, custom: true }))]
    .map((x) => ({ ...x, label: cfg.renames[x.id] ?? x.label, hidden: !!cfg.hidden[x.id] }));
}

/** Tags to offer after a tool: visible ones, most used first, then "Not sure" last. */
export async function offeredTags(group) {
  const cfg = await loadConfig();
  const sessions = await getAll('sessions').catch(() => []);
  const field = { trigger: 'triggers', context: 'context', body: 'body' }[group];
  const used = {};
  for (const s of sessions) for (const l of s[field] || []) used[l] = (used[l] || 0) + 1;
  const tags = groupTags(cfg, group).filter((x) => !x.hidden)
    .map((x, i) => ({ label: x.label, i }))
    .sort((a, b) => (used[b.label] || 0) - (used[a.label] || 0) || a.i - b.i)
    .map((x) => x.label);
  return [...tags, t('tags.notSure')];
}

/** More → Tags: rename, hide or add. */
export async function tagEditor() {
  const view = document.getElementById('view');
  const cfg = await loadConfig();
  const draw = () => {
    view.innerHTML = `<h1>${esc(t('tags.title'))}</h1><p class="muted">${esc(t('tags.intro'))}</p>
      ${GROUPS.map((g) => `<h2>${esc(t('after.groups.' + g))}</h2>
        ${g === 'body' ? `<label class="setting"><span>${esc(t('settings.bodyTags'))}<br><small class="muted">${esc(t('tags.bodyNote'))}</small></span>
          <input type="checkbox" id="bodyOn" ${getSetting('bodyTags') ? 'checked' : ''}></label>` : ''}
        <div class="stack">${groupTags(cfg, g).map((x) => `<div class="item">
          <input type="text" value="${esc(x.label)}" data-id="${x.id}" aria-label="${esc(x.label)}">
          <button data-hide="${x.id}" aria-pressed="${x.hidden}">${esc(t(x.hidden ? 'tags.show' : 'tags.hide'))}</button>
          ${x.custom ? `<button data-rm="${g}:${x.id}">${esc(t('common.remove'))}</button>` : ''}</div>`).join('')}
        <p class="muted">${esc(t('tags.notSure'))}</p>
        <div class="row"><input type="text" class="grow" data-new="${g}" placeholder="${esc(t('tags.newPlaceholder'))}" aria-label="${esc(t('tags.add'))}">
          <button data-add="${g}">${esc(t('tags.add'))}</button></div></div>`).join('')}
      <p><a class="btn" href="#/more">${esc(t('common.back'))}</a></p>`;
    const done = async () => { await saveConfig(cfg); };
    view.querySelector('#bodyOn').onchange = (e) => setSetting('bodyTags', e.target.checked);
    view.querySelectorAll('input[data-id]').forEach((el) => el.onchange = async () => {
      const v = el.value.trim();
      const custom = GROUPS.flatMap((g) => cfg.custom[g]).find((x) => x.id === el.dataset.id);
      if (custom) custom.label = v || custom.label; else if (v) cfg.renames[el.dataset.id] = v; else delete cfg.renames[el.dataset.id];
      await done();
    });
    view.querySelectorAll('[data-hide]').forEach((b) => b.onclick = async () => {
      const id = b.dataset.hide; if (cfg.hidden[id]) delete cfg.hidden[id]; else cfg.hidden[id] = true;
      await done(); draw();
    });
    view.querySelectorAll('[data-rm]').forEach((b) => b.onclick = async () => {
      const [g, id] = b.dataset.rm.split(':'); cfg.custom[g] = cfg.custom[g].filter((x) => x.id !== id); delete cfg.hidden[id];
      await done(); draw();
    });
    view.querySelectorAll('[data-add]').forEach((b) => b.onclick = async () => {
      const g = b.dataset.add, v = view.querySelector(`[data-new="${g}"]`).value.trim();
      if (!v) return;
      cfg.custom[g].push({ id: `c-${Date.now().toString(36)}`, label: v });
      await done(); draw();
    });
  };
  draw();
}
