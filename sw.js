const CACHE="linahub-v10-premium-journal";
const ASSETS=[
"./","./index.html","./app.js?v=101","./manifest.webmanifest?v=101",
"./core/pokemon-seed.js?v=101","./core/data.js?v=101","./core/router.js?v=101",
"./pages/home.js?v=101","./pages/today.js?v=101","./pages/todo.js?v=101","./pages/journal.js?v=101","./pages/plants.js?v=101","./pages/pokemon.js?v=101","./pages/house.js?v=101","./pages/medication.js?v=101","./pages/health.js?v=101","./pages/simple.js?v=101","./pages/aquariums.js?v=101",
"./styles/base.css?v=101","./styles/home.css?v=101","./styles/journal.css?v=101","./styles/plants.css?v=101","./styles/modules.css?v=101",
"./icons/icon-192.png?v=101","./icons/icon-512.png?v=101","./icons/apple-touch-icon.png?v=101"
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
