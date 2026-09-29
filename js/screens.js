import { t, tools, categories, getTool, getDefaults } from './data.js';
import { getSetting, setSetting } from './settings.js';
import { timeBlock, getAll } from './db.js';
import { poHTML } from './po.js';
import { doHandoff, handoffMessage } from './handoff.js';
import { runTool } from './tools/run.js';
import { go } from './router.js';
import { toast } from './tools/common.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const view = () => document.getElementById('view');
const crisis = () => `<p class="crisis" role="note">${esc(t('safety.crisis'))}</p>`;

const toolRow = (id, opener) => {
  const tool = getTool(id);
  return tool ? `<a class="card" href="#/tool/${tool.id}/${opener}"><span>${esc(tool.name)}</span></a>` : '';
};

export async function home() {
  const block = timeBlock();
  const offers = (getDefaults().homeRotation[block] || []).slice(0, 3);
  const plans = (await getAll('contingencies').catch(() => [])).filter((p) => !p.archived);
  view().innerHTML = `
    ${poHTML(block === 'night' ? 'sleep' : 'sit')}
    <p class="center muted">${esc(t('home.offer'))}</p>
    <div class="stack">${offers.map((id) => toolRow(id, 'poSuggestion')).join('')}</div>
    ${plans.length ? `<h2>${esc(t('home.plans'))}</h2><div class="stack"><a class="card" href="#/tool/contingency-builder/browse">${esc(t('home.plans'))}</a></div>` : ''}`;
}

const nowCard = (id) => {
  const c = getDefaults().nowCards[id];
  return `<a class="card big" href="#/tool/${id}/nowButton"><span class="icon" aria-hidden="true">${c.icon}</span><span>${esc(c.label)}</span></a>`;
};

export function now() {
  const ids = getSetting('nowDefaults') || getDefaults().defaults.now;
  const cards = ids.filter((id) => getDefaults().nowCards[id]).slice(0, 3).map(nowCard);
  view().innerHTML = `
    ${poHTML('sit')}
    <div class="stack">${cards.join('')}${getSetting('quiet') ? nowCard('quiet') : ''}</div>
    <div class="stack" style="margin-top:1rem"><button id="handoff" title="${esc(handoffMessage())}">${esc(t('now.handoff'))}: ${esc(handoffMessage())}</button></div>
    ${crisis()}`;
  document.getElementById('handoff').onclick = () => doHandoff(toast);
  const prev = sessionStorage.getItem('prevRoute');
  if (getSetting('autoStart') && prev !== 'tool' && prev !== 'now') {
    go(`/tool/${ids[0]}/nowButton`);
  }
}

export function tool(id, opener = 'browse', asMode) {
  const mode = opener === 'nowButton' ? 'now' : asMode === 'build' || getTool(id)?.category === 'build' ? 'build' : 'library';
  runTool(view(), id, mode, opener);
}

export function build() {
  const list = tools().filter((x) => x.modes.includes('build'));
  view().innerHTML = `<h1>${esc(t('nav.build'))}</h1><p class="muted">${esc(t('build.intro'))}</p>
    <div class="stack">${list.map((x) => `<a class="card" href="#/tool/${x.id}/browse/build">${esc(x.name)}</a>`).join('')}</div>`;
}

export function library() {
  const favs = getSetting('favourites');
  const recent = getSetting('recent');
  const row = (x) => `<li class="row"><a class="card grow" href="#/tool/${x.id}/browse" data-name="${esc(x.name.toLowerCase())}">${esc(x.name)}</a>
    <button class="star" data-id="${x.id}" aria-pressed="${favs.includes(x.id)}" aria-label="Favourite ${esc(x.name)}">★</button></li>`;
  const section = (title, ids) => ids.length ? `<h2>${esc(title)}</h2><ul class="list">${ids.map(getTool).filter(Boolean).map(row).join('')}</ul>` : '';
  const byCat = categories().map((c) => section(c.name, tools().filter((x) => x.category === c.id && x.modes.includes('library')).map((x) => x.id))).join('');
  view().innerHTML = `<h1>${esc(t('nav.library'))}</h1>
    <input type="search" id="q" placeholder="${esc(t('library.search'))}" aria-label="${esc(t('library.search'))}">
    <div id="lists">${section(t('library.favourites'), favs)}${section(t('library.recent'), recent)}${byCat}</div>`;
  const q = document.getElementById('q');
  q.oninput = () => {
    const s = q.value.trim().toLowerCase();
    view().querySelectorAll('#lists li').forEach((li) => { li.hidden = !!s && !li.querySelector('a').dataset.name.includes(s); });
  };
  view().querySelectorAll('.star').forEach((b) => b.onclick = () => {
    const cur = getSetting('favourites');
    setSetting('favourites', cur.includes(b.dataset.id) ? cur.filter((x) => x !== b.dataset.id) : [...cur, b.dataset.id]);
    library();
  });
}

export function more() {
  const it = t('more.items');
  const live = { setup: '#/setup/1', notes: '#/tool/evidence-bank/browse', plans: '#/tool/contingency-builder/browse', parking: '#/tool/parking-lot/browse', prep: '#/tool/appointment-prep/browse', tags: '#/tags', settings: '#/settings', safety: '#/safety' };
  const rows = Object.entries(it).map(([k, label]) => live[k]
    ? `<a class="card" href="${live[k]}">${esc(label)}</a>`
    : `<div class="card" aria-disabled="true"><span>${esc(label)}</span><span class="muted">${esc(t('more.soon'))}</span></div>`);
  view().innerHTML = `<h1>${esc(t('more.title'))}</h1><div class="stack">${rows.join('')}</div>${crisis()}`;
}

export function safety() {
  view().innerHTML = `<h1>${esc(t('more.items.safety'))}</h1>
    <h2>Cold tools</h2><div class="notice">${esc(t('safety.cold'))}</div>${crisis()}
    <p><a href="#/more">${esc(t('now.back'))}</a></p>`;
}

export function settings() {
  const cb = (key, label) => `<label class="setting"><span>${esc(label)}</span><input type="checkbox" data-k="${key}" ${getSetting(key) ? 'checked' : ''}></label>`;
  const sel = (key, label, opts) => `<label class="setting"><span>${esc(label)}</span><select data-k="${key}">${opts.map(([v, l]) => `<option value="${v}" ${getSetting(key) === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label>`;
  view().innerHTML = `<h1>${esc(t('settings.title'))}</h1>
    ${cb('reduceMotion', t('settings.reduceMotion'))}${cb('sound', t('settings.sound'))}${cb('vibration', t('settings.vibration'))}
    ${cb('highContrast', t('settings.highContrast'))}${cb('autoStart', t('settings.autoStart'))}${cb('comfortExhale', t('settings.comfort'))}${cb('afterRow', t('settings.afterRow'))}${cb('bodyTags', t('settings.bodyTags'))}
    ${sel('theme', t('settings.dark'), [['auto', t('settings.darkAuto')], ['dark', t('settings.darkOn')], ['light', t('settings.darkOff')]])}
    ${sel('textSize', t('settings.textSize'), [['small', 'Small'], ['medium', 'Medium'], ['large', 'Large']])}
    <label class="setting" style="align-items:flex-start;flex-direction:column"><span>${esc(t('settings.handoffMessage'))}</span>
      <input type="text" id="hm" value="${esc(handoffMessage())}"></label>
    <p><a href="#/more">${esc(t('now.back'))}</a></p>`;
  view().querySelectorAll('[data-k]').forEach((el) => el.onchange = () =>
    setSetting(el.dataset.k, el.type === 'checkbox' ? el.checked : el.value));
  document.getElementById('hm').onchange = (e) => setSetting('handoffMessage', e.target.value.trim() || null);
}
