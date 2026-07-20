const CACHE="linahub-v17-treasure-room";
const ASSETS=[
"./","./index.html","./app.js?v=170","./manifest.webmanifest?v=170",
"./core/pokemon-seed.js?v=170","./core/data.js?v=170","./core/scheduler.js?v=170","./core/router.js?v=170","./core/cloud.js?v=170",
"./pages/home.js?v=170","./pages/today.js?v=170","./pages/todo.js?v=170","./pages/journal.js?v=170","./pages/plants.js?v=170","./pages/pokemon.js?v=170","./pages/house.js?v=170","./pages/medication.js?v=170","./pages/health.js?v=170","./pages/simple.js?v=170","./pages/aquariums.js?v=170","./pages/period.js?v=170","./pages/treasures.js?v=170",
"./styles/base.css?v=170","./styles/home.css?v=170","./styles/journal.css?v=170","./styles/plants.css?v=170","./styles/modules.css?v=170","./styles/period.css?v=170","./styles/treasures.css?v=170",
"./icons/icon-192.png?v=170","./icons/icon-512.png?v=170","./icons/apple-touch-icon.png?v=170"
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
