const CACHE_NAME = 'forge-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './state.js',
    './utils.js',
    './rules.js',
    './ai.js',
    './testing.js',
    './versioning.js',
    './dependencies.js',
    './ui-enhancements.js',
    './ui.js',
    './frontend-patterns.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching assets');
                return cache.addAll(ASSETS);
            })
    );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Network first for API calls, Cache first for assets
    if (event.request.url.includes('api.anthropic.com')) {
        return; // Let browser handle API calls normally
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});