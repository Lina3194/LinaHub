const CACHE="linahub-v7-enchanted";
const ASSETS=[
"./","./index.html","./app.js?v=70","./manifest.webmanifest?v=70",
"./core/pokemon-seed.js?v=70","./core/data.js?v=70","./core/router.js?v=70",
"./pages/home.js?v=70","./pages/today.js?v=70","./pages/todo.js?v=70","./pages/journal.js?v=70","./pages/plants.js?v=70","./pages/pokemon.js?v=70","./pages/house.js?v=70","./pages/medication.js?v=70","./pages/health.js?v=70","./pages/simple.js?v=70",
"./styles/base.css?v=70","./styles/home.css?v=70","./styles/journal.css?v=70","./styles/plants.css?v=70","./styles/modules.css?v=70",
"./icons/icon-192.png?v=70","./icons/icon-512.png?v=70","./icons/apple-touch-icon.png?v=70"
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
