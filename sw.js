const CACHE="linahub-v16-22-sync-period-layout-fixes";
const ASSETS=[
"./","./index.html","./app.js?v=1622","./manifest.webmanifest?v=1622",
"./core/pokemon-seed.js?v=1622","./core/data.js?v=1622","./core/router.js?v=1622","./core/cloud.js?v=1622",
"./pages/home.js?v=1622","./pages/today.js?v=1622","./pages/todo.js?v=1622","./pages/journal.js?v=1622","./pages/plants.js?v=1622","./pages/pokemon.js?v=1622","./pages/house.js?v=1622","./pages/medication.js?v=1622","./pages/health.js?v=1622","./pages/simple.js?v=1622","./pages/aquariums.js?v=1622","./pages/period.js?v=1622","./pages/treasures.js?v=1622","./pages/budget.js?v=1622",
"./styles/base.css?v=1622","./styles/home.css?v=1622","./styles/journal.css?v=1622","./styles/plants.css?v=1622","./styles/modules.css?v=1622","./styles/period.css?v=1622","./styles/treasures.css?v=1622",
"./icons/icon-192.png?v=1622","./icons/icon-512.png?v=1622","./icons/apple-touch-icon.png?v=1622"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));
    return;
  }
  const isCode=["script","style"].includes(e.request.destination);
  if(isCode){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(e.request,copy));
      return response;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
