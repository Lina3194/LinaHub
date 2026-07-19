const CACHE="linahub-v8-9-global-click-fix";
const ASSETS=[
"./","./index.html","./app.js?v=89","./manifest.webmanifest?v=89",
"./core/pokemon-seed.js?v=89","./core/data.js?v=89","./core/router.js?v=89",
"./pages/home.js?v=89","./pages/today.js?v=89","./pages/todo.js?v=89","./pages/journal.js?v=89","./pages/plants.js?v=89","./pages/pokemon.js?v=89","./pages/house.js?v=89","./pages/medication.js?v=89","./pages/health.js?v=89","./pages/simple.js?v=89","./pages/aquariums.js?v=89",
"./styles/base.css?v=89","./styles/home.css?v=89","./styles/journal.css?v=89","./styles/plants.css?v=89","./styles/modules.css?v=89",
"./icons/icon-192.png?v=89","./icons/icon-512.png?v=89","./icons/apple-touch-icon.png?v=89"
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
