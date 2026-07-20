const CACHE="linahub-v16-27-plant-profile-final";
const ASSETS=[
"./","./index.html","./app.js?v=1627","./manifest.webmanifest?v=1627",
"./core/pokemon-seed.js?v=1627","./core/data.js?v=1627","./core/router.js?v=1627","./core/cloud.js?v=1627",
"./pages/home.js?v=1627","./pages/today.js?v=1627","./pages/todo.js?v=1627","./pages/journal.js?v=1627","./pages/plants.js?v=1627","./pages/pokemon.js?v=1627","./pages/house.js?v=1627","./pages/medication.js?v=1627","./pages/health.js?v=1627","./pages/simple.js?v=1627","./pages/aquariums.js?v=1627","./pages/period.js?v=1627","./pages/treasures.js?v=1627","./pages/budget.js?v=1627",
"./styles/base.css?v=1627","./styles/home.css?v=1627","./styles/journal.css?v=1627","./styles/plants.css?v=1627","./styles/modules.css?v=1627","./styles/period.css?v=1627","./styles/treasures.css?v=1627",
"./icons/icon-192.png?v=1627","./icons/icon-512.png?v=1627","./icons/apple-touch-icon.png?v=1627"
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
