/* Fallplanung PiA — Service Worker
   Nur nötig, wenn die Seite über http(s) ausgeliefert wird.
   Bei einer lokal geöffneten Datei läuft die App ohnehin offline. */
var CACHE = 'fallplanung-v6';
var DATEIEN = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(DATEIEN.map(function (u) {
        return c.add(u).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* Netz zuerst, Cache als Rückfall — so bekommst du Aktualisierungen,
   bleibst aber offline benutzbar. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var kopie = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (t) {
        return t || caches.match('./index.html');
      });
    })
  );
});
