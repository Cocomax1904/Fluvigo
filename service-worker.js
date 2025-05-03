const CACHE_NAME = 'fluvigo-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/style.css',
  '/assets/js/main.js',
  '/assets/js/ripple.js',
  '/assets/img/logo-fluvigo.jpg',
  '/assets/img/fond.png',
  // ajoute ici toutes tes ressources critiques
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  // nettoyage des anciens caches
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  // stratégie cache-first puis network fallback
  evt.respondWith(
    caches.match(evt.request).then(cachedRes =>
      cachedRes || fetch(evt.request)
    )
  );
});
