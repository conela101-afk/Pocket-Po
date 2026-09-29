// Quiet: the screen dims, Po sleeps, nothing is asked. Leaving is a neutral exit, logged as completed.
import { t } from '../data.js';
import { logSession } from '../db.js';
import { poHTML } from '../po.js';
import { go } from '../router.js';
import { esc, cancelAll, backTo } from './common.js';

export function runQuiet(view, tool, mode, opener) {
  cancelAll();
  const startedAt = Date.now();
  view.innerHTML = `<div class="quiet-screen">${poHTML('sleep', 'lg')}
    <button id="leave" class="quiet-leave">${esc(t('now.back'))}</button></div>`;
  view.querySelector('#leave').onclick = async () => {
    await logSession({ tool, mode, opener, startedAt, completed: true, exitedEarly: false });
    go(backTo(mode));
  };
}
