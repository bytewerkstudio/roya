// Service Worker: macht die Apps offline nutzbar.
// Strategie: erst Netz versuchen (damit Updates ankommen), bei Fehler aus dem Speicher laden.
const CACHE = 'roya-apps-v2';
const FILES = ['./', 'index.html', 'deutsch-fuer-roya.html', 'countdown.html', 'icon-flower.png', 'icon-heart.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return r;
      })
      .catch(function () { return caches.match(e.request, { ignoreSearch: true }); })
  );
});
