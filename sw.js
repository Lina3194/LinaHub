const CACHE="linahub-v5-8-todo-energy-tummy";
const ASSETS=[
"./","./index.html","./app.js?v=58","./manifest.webmanifest?v=58",
"./core/data.js?v=58","./core/router.js?v=58",
"./pages/home.js?v=58","./pages/today.js?v=58","./pages/todo.js?v=58","./pages/journal.js?v=58","./pages/plants.js?v=58","./pages/pokemon.js?v=58","./pages/house.js?v=58","./pages/medication.js?v=58","./pages/health.js?v=58","./pages/simple.js?v=58",
"./styles/base.css?v=58","./styles/home.css?v=58","./styles/journal.css?v=58","./styles/plants.css?v=58","./styles/modules.css?v=58",
"./icons/icon-192.png?v=58","./icons/icon-512.png?v=58","./icons/apple-touch-icon.png?v=58"
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
