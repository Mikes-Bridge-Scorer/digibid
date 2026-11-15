/* DigiBid service worker: saves the app so it opens with no internet at all, including on a
   ship's wifi without an internet package. Cache-first (the app rarely changes; bump CACHE when it
   does), with a quiet background refresh. Links with extra bits on the end still open the saved app. */
const CACHE = 'digibid-v31';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => {
      if (res && res.ok && !res.redirected) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    if (req.mode === 'navigate') return caches.match('./index.html').then(app => app || net);
    return net.then(r => r || Response.error());
  }));
});
