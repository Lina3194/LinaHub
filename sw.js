const CACHE="linahub-v8-7-settings-images";
const ASSETS=[
"./","./index.html","./app.js?v=87","./manifest.webmanifest?v=87",
"./core/pokemon-seed.js?v=87","./core/data.js?v=87","./core/router.js?v=87",
"./pages/home.js?v=87","./pages/today.js?v=87","./pages/todo.js?v=87","./pages/journal.js?v=87","./pages/plants.js?v=87","./pages/pokemon.js?v=87","./pages/house.js?v=87","./pages/medication.js?v=87","./pages/health.js?v=87","./pages/simple.js?v=87","./pages/aquariums.js?v=87",
"./styles/base.css?v=87","./styles/home.css?v=87","./styles/journal.css?v=87","./styles/plants.css?v=87","./styles/modules.css?v=87",
"./icons/icon-192.png?v=87","./icons/icon-512.png?v=87","./icons/apple-touch-icon.png?v=87"
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
