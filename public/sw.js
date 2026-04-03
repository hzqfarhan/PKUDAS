const CACHE_NAME = 'edent-v1';
const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first for navigations, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests (mutations must go through network)
  if (request.method !== 'GET') return;

  // Skip Supabase/API requests
  if (request.url.includes('/api/') || request.url.includes('supabase')) return;

  // Navigation requests — network first, fallback to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline') || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Static assets — cache first
  if (
    request.url.includes('/icons/') ||
    request.url.includes('/manifest.json') ||
    request.url.includes('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }
});
