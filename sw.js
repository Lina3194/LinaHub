const CACHE="linahub-v8-6-todo-fix";
const ASSETS=[
"./","./index.html","./app.js?v=86","./manifest.webmanifest?v=86",
"./core/pokemon-seed.js?v=86","./core/data.js?v=86","./core/router.js?v=86",
"./pages/home.js?v=86","./pages/today.js?v=86","./pages/todo.js?v=86","./pages/journal.js?v=86","./pages/plants.js?v=86","./pages/pokemon.js?v=86","./pages/house.js?v=86","./pages/medication.js?v=86","./pages/health.js?v=86","./pages/simple.js?v=86","./pages/aquariums.js?v=86",
"./styles/base.css?v=86","./styles/home.css?v=86","./styles/journal.css?v=86","./styles/plants.css?v=86","./styles/modules.css?v=86",
"./icons/icon-192.png?v=86","./icons/icon-512.png?v=86","./icons/apple-touch-icon.png?v=86"
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
