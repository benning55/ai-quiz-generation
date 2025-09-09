const CACHE_NAME = 'cancitizen-static-v2';
const STATIC_ASSETS = [
  '/manifest.json',
  '/images/maple-leaf.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  // Always fetch fresh HTML and Next.js chunks
  if (req.headers.get('accept')?.includes('text/html') || req.url.includes('/_next/')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // Cache-first for other static files
  event.respondWith(caches.match(req).then(r => r || fetch(req)));
});

