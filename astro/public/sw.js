self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      await self.registration.unregister();
      // Existing tabs use the network; do not reload and discard an unsent enquiry.

    })()
  );
});

// No fetch handler: all requests pass through to the network.
