const CACHE="linahub-v8-4-navigation-rebuild";
const ASSETS=[
"./","./index.html","./app.js?v=84","./manifest.webmanifest?v=84",
"./core/pokemon-seed.js?v=84","./core/data.js?v=84","./core/router.js?v=84",
"./pages/home.js?v=84","./pages/today.js?v=84","./pages/todo.js?v=84","./pages/journal.js?v=84","./pages/plants.js?v=84","./pages/pokemon.js?v=84","./pages/house.js?v=84","./pages/medication.js?v=84","./pages/health.js?v=84","./pages/simple.js?v=84","./pages/aquariums.js?v=84",
"./styles/base.css?v=84","./styles/home.css?v=84","./styles/journal.css?v=84","./styles/plants.css?v=84","./styles/modules.css?v=84",
"./icons/icon-192.png?v=84","./icons/icon-512.png?v=84","./icons/apple-touch-icon.png?v=84"
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
