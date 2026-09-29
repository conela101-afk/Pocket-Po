// Cache-first app shell. Bump VERSION whenever any shell file changes.
// No skipWaiting/claim: a new version takes over on the next launch, never during a running tool.
const VERSION = 'pocket-po-v15';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/app.css', 'css/po.css', 'css/themes.css',
  'js/app.js', 'js/router.js', 'js/db.js', 'js/po.js', 'js/settings.js', 'js/data.js',
  'js/screens.js', 'js/handoff.js', 'js/tools/run.js', 'js/tools/breathe.js', 'js/tools/common.js', 'js/tools/cool.js', 'js/tools/absorb.js', 'js/tools/quiet.js', 'js/tools/guided.js', 'js/tools/play.js', 'js/tools/content.js', 'js/setup.js', 'js/tags.js', 'js/classify.js', 'js/export.js', 'js/export-stats.js', 'js/tools/afterrow.js',
  'data/tools.json', 'data/tags.json', 'data/copy.json', 'data/defaults.json',
  'assets/po/po-sheet.png', 'assets/po/po-sheet.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
