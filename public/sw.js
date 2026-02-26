const SW_VERSION = 'pension-navigator-v3-no-cache';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Never cache anything for now; pass through to network only.
  if (!requestUrl.protocol.startsWith('http')) return;

  event.respondWith(fetch(event.request));
});
