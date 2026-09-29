// Opens a tool. Each tool's `run` field in data/tools.json picks its screen.
// The cool-water caution shows once before first use of any tool that carries it.
import { getTool, t } from '../data.js';
import { getSetting, setSetting } from '../settings.js';
import { go } from '../router.js';
import { esc, backTo } from './common.js';
import { runBreathing } from './breathe.js';
import { runCool } from './cool.js';
import { runPetPo, runPatternTrace } from './absorb.js';
import { runQuiet } from './quiet.js';
import { runGuided, runTimed, runChecklist, runPulse } from './guided.js';
import { runBubbles, runShapes, runKaleidoscope } from './play.js';
import { runList, runPlans, runNameIt, runProsCons, runHandoffTool, runStims } from './content.js';

export const RUNNERS = {
  breathing: runBreathing, cool: runCool, pet: runPetPo, trace: runPatternTrace, quiet: runQuiet,
  guided: runGuided, timed: runTimed, checklist: runChecklist, pulse: runPulse,
  bubbles: runBubbles, shapes: runShapes, kaleido: runKaleidoscope,
  list: runList, plans: runPlans, nameit: runNameIt, pros: runProsCons, handoff: runHandoffTool, stims: runStims
};

export function runTool(view, toolId, mode = 'library', opener = 'browse') {
  const tool = getTool(toolId);
  const run = tool && RUNNERS[tool.run];
  if (!run) return go('/home');

  if (tool.caution && !getSetting('coldAcknowledged')) {
    view.innerHTML = `
      <h1>${esc(t('tool.cautionTitle'))}</h1>
      <div class="notice" role="note">${esc(t('safety.' + tool.caution))}</div>
      <div class="stack">
        <button class="primary" id="ok">${esc(t('tool.ok'))}</button>
        <a class="btn" href="#${backTo(mode)}">${esc(t('now.back'))}</a>
      </div>`;
    view.querySelector('#ok').onclick = () => { setSetting('coldAcknowledged', true); runTool(view, toolId, mode, opener); };
    return;
  }

  if (tool.modes.includes('library')) setSetting('recent', [toolId, ...getSetting('recent').filter((x) => x !== toolId)].slice(0, 8));
  run(view, tool, mode, opener);
}
