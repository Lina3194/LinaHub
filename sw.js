const CACHE="linahub-v8-8-house-editing";
const ASSETS=[
"./","./index.html","./app.js?v=88","./manifest.webmanifest?v=88",
"./core/pokemon-seed.js?v=88","./core/data.js?v=88","./core/router.js?v=88",
"./pages/home.js?v=88","./pages/today.js?v=88","./pages/todo.js?v=88","./pages/journal.js?v=88","./pages/plants.js?v=88","./pages/pokemon.js?v=88","./pages/house.js?v=88","./pages/medication.js?v=88","./pages/health.js?v=88","./pages/simple.js?v=88","./pages/aquariums.js?v=88",
"./styles/base.css?v=88","./styles/home.css?v=88","./styles/journal.css?v=88","./styles/plants.css?v=88","./styles/modules.css?v=88",
"./icons/icon-192.png?v=88","./icons/icon-512.png?v=88","./icons/apple-touch-icon.png?v=88"
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
