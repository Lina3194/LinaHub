const CACHE="linahub-v8-2-dark-theme";
const ASSETS=[
"./","./index.html","./app.js?v=82","./manifest.webmanifest?v=82",
"./core/pokemon-seed.js?v=82","./core/data.js?v=82","./core/router.js?v=82",
"./pages/home.js?v=82","./pages/today.js?v=82","./pages/todo.js?v=82","./pages/journal.js?v=82","./pages/plants.js?v=82","./pages/pokemon.js?v=82","./pages/house.js?v=82","./pages/medication.js?v=82","./pages/health.js?v=82","./pages/simple.js?v=82",
"./styles/base.css?v=82","./styles/home.css?v=82","./styles/journal.css?v=82","./styles/plants.css?v=82","./styles/modules.css?v=82",
"./icons/icon-192.png?v=82","./icons/icon-512.png?v=82","./icons/apple-touch-icon.png?v=82"
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
