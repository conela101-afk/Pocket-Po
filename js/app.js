import { loadData, t } from './data.js';
import { loadPo } from './po.js';
import { applySettings, getSetting, setSetting } from './settings.js';
import { requestPersistence } from './db.js';
import { route, start } from './router.js';
import * as s from './screens.js';

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
  let current = null;
  await start((name) => {
    if (current) sessionStorage.setItem('prevRoute', current); else sessionStorage.removeItem('prevRoute');
    current = name;
    renderNav(name === 'settings' || name === 'safety' ? 'more' : name);
    document.body.toggleAttribute('data-hide-fab', name === 'now' || name === 'tool');
    scrollTo(0, 0);
  });
  if (!getSetting('setupDone')) { setSetting('setupDone', true); requestPersistence(); }
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
main();
