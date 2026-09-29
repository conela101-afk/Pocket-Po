// Cool-water tools: a calm screen for about 30 seconds. No countdown, no numbers.
import { t } from '../data.js';
import { runSession } from './common.js';

export function runCool(view, tool, mode, opener) {
  runSession(view, tool, mode, opener, {
    dur: tool.durationOptions[0] || 30,
    hint: tool.prompt,
    endMessage: t('tool.coolEnd')
  });
}
