const CACHE="linahub-v6-1-friendship-card";
const ASSETS=[
"./","./index.html","./app.js?v=61","./manifest.webmanifest?v=61",
"./core/pokemon-seed.js?v=61","./core/data.js?v=61","./core/router.js?v=61",
"./pages/home.js?v=61","./pages/today.js?v=61","./pages/todo.js?v=61","./pages/journal.js?v=61","./pages/plants.js?v=61","./pages/pokemon.js?v=61","./pages/house.js?v=61","./pages/medication.js?v=61","./pages/health.js?v=61","./pages/simple.js?v=61",
"./styles/base.css?v=61","./styles/home.css?v=61","./styles/journal.css?v=61","./styles/plants.css?v=61","./styles/modules.css?v=61",
"./icons/icon-192.png?v=61","./icons/icon-512.png?v=61","./icons/apple-touch-icon.png?v=61"
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
