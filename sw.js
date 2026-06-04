const CACHE_NAME = 'noe-app3-v__BUILD__';  // Auto-atualizado pelo bump.sh
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/icon-192.png',
    './assets/icon-512.png',
    './js/app.js',
    './js/ui.js',
    './js/storage.js',
    './js/auth.js',
    './css/tokens.css',
    './css/components.css',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return res;
            })
            .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
});

self.addEventListener('message', event => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
