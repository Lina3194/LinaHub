const CACHE="linahub-v5-5-taskshealth";
const ASSETS=[
"./","./index.html","./app.js?v=55","./manifest.webmanifest?v=55",
"./core/data.js?v=55","./core/router.js?v=55",
"./pages/home.js?v=55","./pages/today.js?v=55","./pages/journal.js?v=55","./pages/plants.js?v=55","./pages/pokemon.js?v=55","./pages/house.js?v=55","./pages/medication.js?v=55","./pages/health.js?v=55","./pages/simple.js?v=55",
"./styles/base.css?v=55","./styles/home.css?v=55","./styles/journal.css?v=55","./styles/plants.css?v=55","./styles/modules.css?v=55",
"./icons/icon-192.png?v=55","./icons/icon-512.png?v=55","./icons/apple-touch-icon.png?v=55"
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
