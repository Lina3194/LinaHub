const CACHE="linahub-v7-1-feed-status";
const ASSETS=[
"./","./index.html","./app.js?v=71","./manifest.webmanifest?v=71",
"./core/pokemon-seed.js?v=71","./core/data.js?v=71","./core/router.js?v=71",
"./pages/home.js?v=71","./pages/today.js?v=71","./pages/todo.js?v=71","./pages/journal.js?v=71","./pages/plants.js?v=71","./pages/pokemon.js?v=71","./pages/house.js?v=71","./pages/medication.js?v=71","./pages/health.js?v=71","./pages/simple.js?v=71",
"./styles/base.css?v=71","./styles/home.css?v=71","./styles/journal.css?v=71","./styles/plants.css?v=71","./styles/modules.css?v=71",
"./icons/icon-192.png?v=71","./icons/icon-512.png?v=71","./icons/apple-touch-icon.png?v=71"
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
