const CACHE = 'flowforge-ai-v1';
const ROOT = new URL('./', self.location.href);
const ASSETS = [
  './', './index.html', './styles.css', './js/app.js', './js/engine.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png'
].map(path => new URL(path, ROOT).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('flowforge-ai-') && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== ROOT.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(new URL('./index.html', ROOT).href, response.clone()));
      return response;
    }).catch(() => caches.match(new URL('./index.html', ROOT).href)));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response.ok && new URL(request.url).pathname.startsWith(ROOT.pathname)) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
