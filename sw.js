const CACHE="linahub-v10-premium-journal";
const ASSETS=[
"./","./index.html","./app.js?v=100","./manifest.webmanifest?v=100",
"./core/pokemon-seed.js?v=100","./core/data.js?v=100","./core/router.js?v=100",
"./pages/home.js?v=100","./pages/today.js?v=100","./pages/todo.js?v=100","./pages/journal.js?v=100","./pages/plants.js?v=100","./pages/pokemon.js?v=100","./pages/house.js?v=100","./pages/medication.js?v=100","./pages/health.js?v=100","./pages/simple.js?v=100","./pages/aquariums.js?v=100",
"./styles/base.css?v=100","./styles/home.css?v=100","./styles/journal.css?v=100","./styles/plants.css?v=100","./styles/modules.css?v=100",
"./icons/icon-192.png?v=100","./icons/icon-512.png?v=100","./icons/apple-touch-icon.png?v=100"
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
