const CACHE="linahub-v8-sakura";
const ASSETS=[
"./","./index.html","./app.js?v=80","./manifest.webmanifest?v=80",
"./core/pokemon-seed.js?v=80","./core/data.js?v=80","./core/router.js?v=80",
"./pages/home.js?v=80","./pages/today.js?v=80","./pages/todo.js?v=80","./pages/journal.js?v=80","./pages/plants.js?v=80","./pages/pokemon.js?v=80","./pages/house.js?v=80","./pages/medication.js?v=80","./pages/health.js?v=80","./pages/simple.js?v=80",
"./styles/base.css?v=80","./styles/home.css?v=80","./styles/journal.css?v=80","./styles/plants.css?v=80","./styles/modules.css?v=80",
"./icons/icon-192.png?v=80","./icons/icon-512.png?v=80","./icons/apple-touch-icon.png?v=80"
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
