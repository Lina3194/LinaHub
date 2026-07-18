const CACHE="linahub-v6-3-measurement-time";
const ASSETS=[
"./","./index.html","./app.js?v=63","./manifest.webmanifest?v=63",
"./core/pokemon-seed.js?v=63","./core/data.js?v=63","./core/router.js?v=63",
"./pages/home.js?v=63","./pages/today.js?v=63","./pages/todo.js?v=63","./pages/journal.js?v=63","./pages/plants.js?v=63","./pages/pokemon.js?v=63","./pages/house.js?v=63","./pages/medication.js?v=63","./pages/health.js?v=63","./pages/simple.js?v=63",
"./styles/base.css?v=63","./styles/home.css?v=63","./styles/journal.css?v=63","./styles/plants.css?v=63","./styles/modules.css?v=63",
"./icons/icon-192.png?v=63","./icons/icon-512.png?v=63","./icons/apple-touch-icon.png?v=63"
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
