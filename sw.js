const CACHE="linahub-v5-4-todaynav";
const ASSETS=[
"./","./index.html","./app.js?v=54","./manifest.webmanifest?v=54",
"./core/data.js?v=54","./core/router.js?v=54",
"./pages/home.js?v=54","./pages/today.js?v=54","./pages/journal.js?v=54","./pages/plants.js?v=54","./pages/pokemon.js?v=54","./pages/house.js?v=54","./pages/medication.js?v=54","./pages/health.js?v=54","./pages/simple.js?v=54",
"./styles/base.css?v=54","./styles/home.css?v=54","./styles/journal.css?v=54","./styles/plants.css?v=54","./styles/modules.css?v=54",
"./icons/icon-192.png?v=54","./icons/icon-512.png?v=54","./icons/apple-touch-icon.png?v=54"
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
