const CACHE = 'digibid-v30';
const ASSETS = ['./digibid.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('DigiBid SW install failed:', err))
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, responseClone));
        }
        return response;
      });
    })
  );
});
