// Self-destruct and purge service worker to prevent development white-screen caching conflicts
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
      .then(() => {
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          for (const client of clients) {
            client.navigate(client.url);
          }
        });
      })
  );
});

// Pass-through all fetch requests directly to network without caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
