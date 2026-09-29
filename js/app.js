import { loadData, t } from './data.js';
import { loadPo } from './po.js';
import { applySettings, getSetting, setSetting } from './settings.js';
import { requestPersistence } from './db.js';
import { route, start } from './router.js';
import * as s from './screens.js';
import { setup } from './setup.js';
import { tagEditor } from './tags.js';
import { exportScreen } from './export.js';

const NAV = [['home', '/home'], ['now', '/now'], ['build', '/build'], ['library', '/library'], ['more', '/more']];

function renderNav(active) {
  const nav = document.getElementById('nav');
  nav.innerHTML = NAV.map(([k, href]) =>
    `<a href="#${href}" ${k === active ? 'aria-current="page"' : ''}>${t('nav.' + k)}</a>`).join('');
  // Now button floats everywhere except Now itself and inside a running tool.
  document.body.toggleAttribute('data-hide-fab', active === 'now' || active === 'tool');
  document.getElementById('now-fab').textContent = t('nav.now');
}

async function main() {
  applySettings();
  await Promise.all([loadData(), loadPo()]);
  route('home', s.home);
  route('now', s.now);
  route('tool', s.tool);
  route('build', s.build);
  route('library', s.library);
  route('more', s.more);
  route('settings', s.settings);
  route('safety', s.safety);
  route('setup', setup);
  route('tags', tagEditor);
  route('export', exportScreen);
  let current = null;
  // First launch only: offer setup. A direct #/now (the shortcut) is never redirected.
  if (!getSetting('setupState') && ['', '#', '#/', '#/home'].includes(location.hash)) location.hash = '#/setup';
  await start((name) => {
    if (current) sessionStorage.setItem('prevRoute', current); else sessionStorage.removeItem('prevRoute');
    current = name;
    renderNav(['settings', 'safety', 'setup', 'tags', 'export'].includes(name) ? 'more' : name);
    document.body.toggleAttribute('data-hide-fab', ['now', 'tool', 'setup'].includes(name));
    scrollTo(0, 0);
  });
  if (!getSetting('persistAsked')) { setSetting('persistAsked', true); requestPersistence(); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
main();
