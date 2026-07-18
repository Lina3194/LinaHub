const CACHE="linahub-v6-0-pokemon-import";
const ASSETS=[
"./","./index.html","./app.js?v=60","./manifest.webmanifest?v=60",
"./core/pokemon-seed.js?v=60","./core/data.js?v=60","./core/router.js?v=60",
"./pages/home.js?v=60","./pages/today.js?v=60","./pages/todo.js?v=60","./pages/journal.js?v=60","./pages/plants.js?v=60","./pages/pokemon.js?v=60","./pages/house.js?v=60","./pages/medication.js?v=60","./pages/health.js?v=60","./pages/simple.js?v=60",
"./styles/base.css?v=60","./styles/home.css?v=60","./styles/journal.css?v=60","./styles/plants.css?v=60","./styles/modules.css?v=60",
"./icons/icon-192.png?v=60","./icons/icon-512.png?v=60","./icons/apple-touch-icon.png?v=60"
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
