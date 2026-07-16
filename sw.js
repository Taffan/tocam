const CACHE_NAME = 'foto-reports-v16';

const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './data.js',
  './manifest.json',
  './version.json',
  './lib/jszip.min.js',
  './lib/zxing.min.js',
  './lib/xlsx.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage('SW_UPDATED'));
      });
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.pathname.includes('version.json')) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.status === 200 && response.type === 'basic') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => {
      return caches.match(event.request).then((cached) => {
        return cached || new Response('Offline', { status: 503 });
      });
    })
  );
});
