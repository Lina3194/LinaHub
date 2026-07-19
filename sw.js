const CACHE="linahub-v9-0-custom-rooms";
const ASSETS=[
"./","./index.html","./app.js?v=90","./manifest.webmanifest?v=90",
"./core/pokemon-seed.js?v=90","./core/data.js?v=90","./core/router.js?v=90",
"./pages/home.js?v=90","./pages/today.js?v=90","./pages/todo.js?v=90","./pages/journal.js?v=90","./pages/plants.js?v=90","./pages/pokemon.js?v=90","./pages/house.js?v=90","./pages/medication.js?v=90","./pages/health.js?v=90","./pages/simple.js?v=90","./pages/aquariums.js?v=90",
"./styles/base.css?v=90","./styles/home.css?v=90","./styles/journal.css?v=90","./styles/plants.css?v=90","./styles/modules.css?v=90",
"./icons/icon-192.png?v=90","./icons/icon-512.png?v=90","./icons/apple-touch-icon.png?v=90"
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
