const CACHE="linahub-v10-premium-journal";
const ASSETS=[
"./","./index.html","./app.js?v=110","./manifest.webmanifest?v=110",
"./core/pokemon-seed.js?v=110","./core/data.js?v=110","./core/router.js?v=110",
"./pages/home.js?v=110","./pages/today.js?v=110","./pages/todo.js?v=110","./pages/journal.js?v=110","./pages/plants.js?v=110","./pages/pokemon.js?v=110","./pages/house.js?v=110","./pages/medication.js?v=110","./pages/health.js?v=110","./pages/simple.js?v=110","./pages/aquariums.js?v=110",
"./styles/base.css?v=110","./styles/home.css?v=110","./styles/journal.css?v=110","./styles/plants.css?v=110","./styles/modules.css?v=110",
"./icons/icon-192.png?v=110","./icons/icon-512.png?v=110","./icons/apple-touch-icon.png?v=110"
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
