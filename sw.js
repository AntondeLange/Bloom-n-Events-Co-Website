// Cache version - update this when you want to invalidate all caches
// Format: vYYYYMMDD (e.g., v20250115)
// Update this date when deploying significant changes
// For automated deployments, consider using a build script to inject the deployment date
const CACHE_VERSION = 'v20250115'; // Update this date on each deployment to clear cache
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// Use relative paths so it works under subdirectory hosting (e.g., GitHub Pages)
const STATIC_ASSETS = [
  'index.html',
  'assets/css/main.css',
  'assets/js/main.js',
  'assets/images/logo-wht.png',
  'assets/images/logo-blk.png',
  'assets/images/logo-blk-long.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Delete all old caches that don't match current version
      const deletePromises = keys
        .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
        .map((k) => caches.delete(k));
      
      // Also delete caches with old version numbers
      const versionMismatch = keys.filter((k) => {
        const hasVersion = k.includes('v');
        if (!hasVersion) return true; // Delete caches without version
        const cacheVersion = k.match(/v(\d{8})/);
        return cacheVersion && cacheVersion[1] !== CACHE_VERSION.replace('v', '');
      });
      versionMismatch.forEach((k) => deletePromises.push(caches.delete(k)));
      
      return Promise.all(deletePromises);
    }).then(() => {
      // Force all clients to reload to get fresh content
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CACHE_CLEARED', version: CACHE_VERSION });
        });
      });
    }).then(() => self.clients.claim())
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

  // Config files: always go to network (no caching) - important for backend URL updates
  if (url.pathname.includes('assets/js/config.js') || url.pathname.includes('assets/js/logger.js')) {
    event.respondWith(fetch(req));
    return;
  }

  // External CDN resources: bypass service worker entirely (no caching, no opaque response issues)
  const isExternalCDN = url.hostname.includes('cdn.jsdelivr.net') || 
                        url.hostname.includes('fonts.googleapis.com') || 
                        url.hostname.includes('fonts.gstatic.com') ||
                        url.hostname.includes('googletagmanager.com') ||
                        url.hostname.includes('google-analytics.com');
  if (isExternalCDN) {
    event.respondWith(fetch(req));
    return;
  }

  // Static assets: cache-first (only for same-origin resources)
  if (['style', 'script', 'image', 'font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const res = await fetch(req);
      try {
        // Only cache same-origin resources with successful responses
        if (res && res.ok && res.type !== 'opaque') {
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

  // Fallback: network-first with cache fallback (only for same-origin resources)
  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      try {
        // Only cache same-origin resources with successful responses
        if (res && res.ok && res.type !== 'opaque') {
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


