// Shared tool screen. Milestone 1 stub: shows the tool and a large Stop that exits instantly.
// Real per-tool screens replace this in Milestones 2 to 4.
import { getTool, t } from '../data.js';
import { getSetting, setSetting } from '../settings.js';
import { logSession } from '../db.js';
import { poHTML } from '../po.js';
import { go } from '../router.js';
import { runBreathing } from './breathe.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function runTool(view, toolId, mode = 'library', opener = 'browse') {
  const tool = getTool(toolId);
  if (!tool) return go('/home');
  const back = mode === 'now' ? '/now' : '/home';

  const cautionBlock = () => tool.caution
    ? `<div class="notice" id="caution" role="note">${esc(t('safety.' + tool.caution))}</div>` : '';

  if (tool.caution && !getSetting('coldAcknowledged')) {
    view.innerHTML = `
      <h1>${esc(t('tool.cautionTitle'))}</h1>
      ${cautionBlock()}
      <div class="stack">
        <button class="primary" id="ok">${esc(t('tool.ok'))}</button>
        <a class="btn" href="#${back}">${esc(t('now.back'))}</a>
      </div>`;
    view.querySelector('#ok').onclick = () => { setSetting('coldAcknowledged', true); runTool(view, toolId, mode, opener); };
    return;
  }

  const recent = [toolId, ...getSetting('recent').filter((x) => x !== toolId)].slice(0, 8);
  setSetting('recent', recent);

  if (tool.category === 'breathing') return runBreathing(view, tool, mode, opener);

  const startedAt = Date.now();
  view.innerHTML = `
    <div class="center">
      ${poHTML('sit')}
      <h1>${esc(tool.name)}</h1>
      <p>${esc(tool.prompt)}</p>
      <p class="muted">${esc(t('tool.stub'))}</p>
    </div>
    ${tool.caution ? `<button id="info" aria-label="${esc(t('tool.cautionTitle'))}">${esc(t('tool.info'))}</button><div id="cautionSlot"></div>` : ''}
    <div class="stopbar stack">
      <button id="done">${esc(t('tool.done'))}</button>
      <button class="primary" id="stop">${esc(t('now.stop'))}</button>
    </div>`;

  const finish = async (completed) => {
    await logSession({ tool, mode, opener, startedAt, completed, exitedEarly: !completed });
    go(back);
  };
  view.querySelector('#stop').onclick = () => finish(false);
  view.querySelector('#done').onclick = () => finish(true);
  const info = view.querySelector('#info');
  if (info) info.onclick = () => {
    const slot = view.querySelector('#cautionSlot');
    slot.innerHTML = slot.innerHTML ? '' : cautionBlock();
  };
}
