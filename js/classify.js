// How a logged session is described. Shared by logging and the export so they always agree.
// No imports, so scripts can test it without a browser.

/** Tools that hold the user's own content. Leaving them is never counted as an early exit. */
export const CONTENT_RUNS = ['list', 'plans', 'nameit', 'pros', 'handoff', 'stims'];

/** Leaving a tool sooner than this is recorded as "opened", not as an early exit. */
export const OPENED_UNDER_SEC = 5;

/**
 * completed | early | opened | content
 * Older records without the newer fields are described by the same rules.
 */
export function classify(s, toolsById = {}) {
  const run = toolsById[s.toolId]?.run;
  if (s.contentTool || CONTENT_RUNS.includes(run)) return 'content';
  if (s.completed) return 'completed';
  if (s.opened || (s.exitedEarly && (s.durationSec ?? 0) < OPENED_UNDER_SEC)) return 'opened';
  if (s.exitedEarly) return 'early';
  return 'completed';
}
