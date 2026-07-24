const BUILD_VERSION = 'linahub-v16.88';
const CACHE = 'linahub-v16-88';
const ASSETS = [
  './', './index.html', './styles.css?v=1688', './app.bundle.js?v=1688',
  './manifest.webmanifest?v=1688', './icon-192.png?v=1688',
  './icon-512.png?v=1688', './apple-touch-icon.png?v=1688',
  './favicon.png?v=1688', './pokemon.svg?v=1688'
];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => caches.match('./index.html')));
    return;
  }
  const isCode = ['script','style'].includes(event.request.destination);
  if (isCode) {
    event.respondWith(fetch(event.request, {cache:'no-store'}).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = './' + (event.notification.data?.route ? `#${event.notification.data.route}` : '');
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
    for (const client of list) {
      if ('focus' in client) {
        client.postMessage({type:'LINAHUB_ROUTE', route:event.notification.data?.route || 'home'});
        return client.focus();
      }
    }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});
