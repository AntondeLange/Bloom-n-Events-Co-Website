const CACHE_VERSION = 'v3';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Use relative paths so it works under subdirectory hosting (e.g., GitHub Pages)
const STATIC_ASSETS = [
  'index.html',
  'styles.css',
  'scripts.js',
  'images/logo-wht.png',
  'images/logo-blk.png',
  'images/logo-blk-long.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Cache-first for static; bypass HTML to avoid document mismatches under subpaths
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;

  // HTML: always go to network (no caching)
  if (req.destination === 'document' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(fetch(req));
    return;
  }

  // Static assets: cache-first
  if (['style', 'script', 'image', 'font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      try {
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(req, res.clone());
        }
      } catch (_) {
        // no-op: avoid unhandled promise rejection in cache.put
      }
      return res;
    })());
    return;
  }

  // Fallback: network-first with cache fallback
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      try {
        if (res && (res.ok || res.type === 'opaque')) {
          const cache = await caches.open(RUNTIME_CACHE);
          await cache.put(req, res.clone());
        }
      } catch (_) {
        // no-op
      }
      return res;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      return new Response('Network error', { status: 504, statusText: 'Gateway Timeout' });
    }
  })());
});


