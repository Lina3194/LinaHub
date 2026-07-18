const CACHE="linahub-v5-7-icons-todo-journal";
const ASSETS=[
"./","./index.html","./app.js?v=57","./manifest.webmanifest?v=57",
"./core/data.js?v=57","./core/router.js?v=57",
"./pages/home.js?v=57","./pages/today.js?v=57","./pages/todo.js?v=57","./pages/journal.js?v=57","./pages/plants.js?v=57","./pages/pokemon.js?v=57","./pages/house.js?v=57","./pages/medication.js?v=57","./pages/health.js?v=57","./pages/simple.js?v=57",
"./styles/base.css?v=57","./styles/home.css?v=57","./styles/journal.css?v=57","./styles/plants.css?v=57","./styles/modules.css?v=57",
"./icons/icon-192.png?v=57","./icons/icon-512.png?v=57","./icons/apple-touch-icon.png?v=57"
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
