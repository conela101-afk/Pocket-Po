// Small settings in localStorage. Everything degrades to defaults if storage is unavailable.
const KEY = 'pocketpo.settings';
const DEFAULTS = {
  reduceMotion: false, sound: false, vibration: false, theme: 'auto', textSize: 'medium',
  highContrast: false, autoStart: false, handoffMessage: null, nowDefaults: null, quiet: null,
  coldAcknowledged: false, setupDone: false, favourites: [], recent: []
};

let cache = null;

function load() {
  if (cache) return cache;
  try { cache = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { cache = { ...DEFAULTS }; }
  return cache;
}

export function getSetting(name) { return load()[name]; }

export function setSetting(name, value) {
  load()[name] = value;
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* still works this session */ }
  applySettings();
}

export function applySettings() {
  const s = load();
  const root = document.documentElement;
  const motion = s.reduceMotion || matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.dataset.motion = motion ? 'reduce' : 'full';
  if (s.theme === 'auto') delete root.dataset.theme; else root.dataset.theme = s.theme;
  root.dataset.textsize = s.textSize;
  if (s.highContrast) root.dataset.contrast = 'high'; else delete root.dataset.contrast;
}
