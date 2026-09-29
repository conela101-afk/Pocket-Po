// Cache-first app shell. Bump VERSION whenever any shell file changes.
const VERSION = 'pocket-po-v2';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/app.css', 'css/po.css', 'css/themes.css',
  'js/app.js', 'js/router.js', 'js/db.js', 'js/po.js', 'js/settings.js', 'js/data.js',
  'js/screens.js', 'js/handoff.js', 'js/tools/run.js',
  'data/tools.json', 'data/tags.json', 'data/copy.json', 'data/defaults.json',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png', 'assets/icons/icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
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
