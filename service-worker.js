const CACHE_VERSION = 'v4';
const CACHE_NAME = `atasozleri-cache-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `atasozleri-data-${CACHE_VERSION}`;

// Static assets - cache-first strategy
const STATIC_ASSETS = [
    '/',
    'index.html',
    'style.css',
    'manifest.json',
    // Icons
    'icon-72.png',
    'icon-96.png',
    'icon-128.png',
    'icon-144.png',
    'icon-152.png',
    'icon-192.png',
    'icon-384.png',
    'icon-512.png',
    // Panda images
    'panda-normal.png',
    'panda-mutlu.png',
    'panda-uzgun.png',
    // JS modules
    'js/App.js',
    'js/GameEngine.js',
    'js/UIController.js',
    'js/TimerManager.js',
    'js/PandaController.js',
    'js/LeaderboardService.js',
    'js/AudioManager.js',
    'js/GameConfig.js',
    'firebase-config.js'
];

// Dynamic data - network-first strategy
const DYNAMIC_DATA = [
    'atasozleri.json',
    'deyimler.json',
    'proverbs.json'
];

// Install event - cache static assets and critical data
self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('[ServiceWorker] Caching static assets');
                    return cache.addAll(STATIC_ASSETS);
                }),
            // Pre-cache JSON data for offline support
            caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    console.log('[ServiceWorker] Pre-caching JSON data');
                    return cache.addAll(DYNAMIC_DATA);
                })
        ])
        .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        // Delete old cache versions
                        if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Firebase and external requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Check if it's a dynamic data file
    const isDynamicData = DYNAMIC_DATA.some(file => url.pathname.includes(file));
    
    if (isDynamicData) {
        // Network-first strategy for JSON data
        event.respondWith(networkFirstStrategy(request));
    } else {
        // Cache-first strategy for static assets
        event.respondWith(cacheFirstStrategy(request));
    }
});

// Network-first strategy (for dynamic data)
async function networkFirstStrategy(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // If successful, update cache
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(DATA_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        console.log('[ServiceWorker] Network failed, using cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // No cache available, return offline page or error
        return new Response(
            JSON.stringify({ error: 'Offline and no cache available' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Cache-first strategy (for static assets)
async function cacheFirstStrategy(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Return cached version and update in background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        
        // Cache the new response
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[ServiceWorker] Fetch failed:', request.url);
        
        // Return offline fallback if available
        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Update cache in background (stale-while-revalidate)
function updateCacheInBackground(request) {
    fetch(request)
        .then(response => {
            if (response && response.status === 200) {
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(request, response));
            }
        })
        .catch(() => {
            // Silently fail - we already have cached version
        });
}

// Message handler for manual cache refresh
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            })
        );
    }
});
