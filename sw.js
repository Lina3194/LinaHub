const CACHE="linahub-v5-6-todo-med-health";
const ASSETS=[
"./","./index.html","./app.js?v=56","./manifest.webmanifest?v=56",
"./core/data.js?v=56","./core/router.js?v=56",
"./pages/home.js?v=56","./pages/today.js?v=56","./pages/todo.js?v=56","./pages/journal.js?v=56","./pages/plants.js?v=56","./pages/pokemon.js?v=56","./pages/house.js?v=56","./pages/medication.js?v=56","./pages/health.js?v=56","./pages/simple.js?v=56",
"./styles/base.css?v=56","./styles/home.css?v=56","./styles/journal.css?v=56","./styles/plants.css?v=56","./styles/modules.css?v=56",
"./icons/icon-192.png?v=56","./icons/icon-512.png?v=56","./icons/apple-touch-icon.png?v=56"
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
