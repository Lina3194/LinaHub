const CACHE="linahub-v5-modular";
const ASSETS=[
"./","./index.html","./app.js?v=5","./manifest.webmanifest?v=5",
"./core/data.js?v=5","./core/router.js?v=5",
"./pages/home.js?v=5","./pages/journal.js?v=5","./pages/plants.js?v=5","./pages/simple.js?v=5",
"./styles/base.css?v=5","./styles/home.css?v=5","./styles/journal.css?v=5","./styles/plants.css?v=5",
"./icons/icon-192.png?v=5","./icons/icon-512.png?v=5","./icons/apple-touch-icon.png?v=5"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
