// Guided tools driven by data/tools.json: steps you move through at your own pace,
// timed steps that rotate by themselves, a tick list, and a two-sided tapping pulse.
// No step counters and no progress bars.
import { t } from '../data.js';
import { runSession, later, every, esc } from './common.js';

/** One step at a time. Next moves on; `stepSec` (optional) moves on by itself. */
export function runGuided(view, tool, mode, opener) {
  const steps = tool.steps;
  runSession(view, tool, mode, opener, {
    hint: steps[0],
    stage: `<div class="stack"><button class="primary" id="next">${esc(t(steps.length === 1 ? 'common.done' : 'common.next'))}</button></div>`,
    mount({ stage, isEnded, finish, setHint }) {
      let i = 0, timer = null;
      const btn = stage.querySelector('#next');
      const arm = () => {
        clearTimeout(timer);
        if (tool.stepSec && i < steps.length - 1) timer = later(advance, tool.stepSec * 1000);
      };
      const advance = () => {
        if (isEnded()) return;
        if (i >= steps.length - 1) return finish(true);
        i++; setHint(steps[i]);
        btn.textContent = t(i === steps.length - 1 ? 'common.done' : 'common.next');
        arm();
      };
      btn.onclick = advance;
      arm();
    }
  });
}

/** Steps rotate evenly across the chosen time, then Po settles. Nothing to press. */
export function runTimed(view, tool, mode, opener) {
  const steps = tool.steps, dur = tool.durationOptions[0];
  runSession(view, tool, mode, opener, {
    dur, hint: steps[0],
    mount({ isEnded, setHint }) {
      let i = 0;
      every(() => { if (!isEnded() && i < steps.length - 1) setHint(steps[++i]); }, (dur * 1000) / steps.length);
    }
  });
}

/** A tick list. Every item is optional; Done is always available. */
export function runChecklist(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    hint: t('checklist.intro'),
    stage: `<div class="stack">${tool.steps.map((s) => `<button class="tick" aria-pressed="false"><span class="box" aria-hidden="true"></span><span>${esc(s)}</span></button>`).join('')}
      <button class="primary" id="fin">${esc(t('common.done'))}</button></div>`,
    mount({ stage, finish }) {
      stage.querySelectorAll('.tick').forEach((b) => b.onclick = () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'));
      stage.querySelector('#fin').onclick = () => finish(true);
    }
  });
}

/** Butterfly hug: two dots take turns as a slow left-right cue. The word cue always shows too. */
export function runPulse(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    dur: tool.durationOptions[0], hint: t('tool.pulse'),
    stage: `<div class="pulse" aria-hidden="true"><span class="dot on"></span><span class="dot"></span></div>`,
    mount({ stage, isEnded }) {
      const dots = stage.querySelectorAll('.dot');
      let side = 0;
      every(() => { if (isEnded()) return; side ^= 1; dots.forEach((d, i) => d.classList.toggle('on', i === side)); }, 1000);
    }
  });
}
