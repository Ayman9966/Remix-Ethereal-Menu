const CACHE_NAME = 'savor-cache-v1';
const OFFLINE_URL = '/';

// Assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/menu',
  '/pos',
  '/kitchen',
  '/admin',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests
  if (!request.url.startsWith('http')) return;

  // Network-first for navigation, cache-first for assets
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(OFFLINE_URL)))
    );
  } else {
    // Cache-first for assets (JS, CSS, images, fonts)
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Background update
          fetch(request).then((response) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
          }).catch(() => {
            return;
          });
          return cached;
        }
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
  }
});
