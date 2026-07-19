const CACHE="linahub-v8-3-navigation-plants-aquarium";
const ASSETS=[
"./","./index.html","./app.js?v=83","./manifest.webmanifest?v=83",
"./core/pokemon-seed.js?v=83","./core/data.js?v=83","./core/router.js?v=83",
"./pages/home.js?v=83","./pages/today.js?v=83","./pages/todo.js?v=83","./pages/journal.js?v=83","./pages/plants.js?v=83","./pages/pokemon.js?v=83","./pages/house.js?v=83","./pages/medication.js?v=83","./pages/health.js?v=83","./pages/simple.js?v=83","./pages/aquariums.js?v=83",
"./styles/base.css?v=83","./styles/home.css?v=83","./styles/journal.css?v=83","./styles/plants.css?v=83","./styles/modules.css?v=83",
"./icons/icon-192.png?v=83","./icons/icon-512.png?v=83","./icons/apple-touch-icon.png?v=83"
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
