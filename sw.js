const CACHE="linahub-v5-3-modules";
const ASSETS=[
"./","./index.html","./app.js?v=53","./manifest.webmanifest?v=53",
"./core/data.js?v=53","./core/router.js?v=53",
"./pages/home.js?v=53","./pages/journal.js?v=53","./pages/plants.js?v=53","./pages/pokemon.js?v=53","./pages/house.js?v=53","./pages/medication.js?v=53","./pages/health.js?v=53","./pages/simple.js?v=53",
"./styles/base.css?v=53","./styles/home.css?v=53","./styles/journal.css?v=53","./styles/plants.css?v=53","./styles/modules.css?v=53",
"./icons/icon-192.png?v=53","./icons/icon-512.png?v=53","./icons/apple-touch-icon.png?v=53"
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
