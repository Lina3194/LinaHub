const CACHE="linahub-v12-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=120","./manifest.webmanifest?v=120",
"./core/pokemon-seed.js?v=120","./core/data.js?v=120","./core/router.js?v=120","./core/cloud.js?v=120",
"./pages/home.js?v=120","./pages/today.js?v=120","./pages/todo.js?v=120","./pages/journal.js?v=120","./pages/plants.js?v=120","./pages/pokemon.js?v=120","./pages/house.js?v=120","./pages/medication.js?v=120","./pages/health.js?v=120","./pages/simple.js?v=120","./pages/aquariums.js?v=120",
"./styles/base.css?v=120","./styles/home.css?v=120","./styles/journal.css?v=120","./styles/plants.css?v=120","./styles/modules.css?v=120",
"./icons/icon-192.png?v=120","./icons/icon-512.png?v=120","./icons/apple-touch-icon.png?v=120"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
