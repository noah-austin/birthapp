// Offline-first service worker. The birth center wifi is not a plan, so the
// whole app shell is cached on install and served from cache first.

const CACHE = 'clara-v1';

const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/app.css',
  '/js/app.js',
  '/js/state.js',
  '/js/sync.js',
  '/js/util.js',
  '/js/data/cards.js',
  '/js/data/plans.js',
  '/js/data/playbook.js',
  '/js/data/checklists.js',
  '/js/views/home.js',
  '/js/views/timer.js',
  '/js/views/cards.js',
  '/js/views/plan.js',
  '/js/views/breathe.js',
  '/js/views/playbook.js',
  '/js/views/log.js',
  '/js/views/checklists.js',
  '/js/views/postpartum.js',
  '/js/views/prayer.js',
  '/js/views/more.js',
  '/js/views/settings.js',
  '/icons/icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  // Sync traffic must always hit the network; never serve it stale.
  if (url.pathname.startsWith('/api/') || url.pathname === '/sync') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached || caches.match('/index.html'));

      // Cache-first for speed, but refresh in the background for next time.
      return cached || network;
    }),
  );
});
