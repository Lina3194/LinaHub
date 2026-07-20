const CACHE="linahub-v16-1-smart-weekdays";
const ASSETS=[
"./","./index.html","./app.js?v=161","./manifest.webmanifest?v=161",
"./core/pokemon-seed.js?v=161","./core/data.js?v=161","./core/scheduler.js?v=161","./core/router.js?v=161","./core/cloud.js?v=161",
"./pages/home.js?v=161","./pages/today.js?v=161","./pages/todo.js?v=161","./pages/journal.js?v=161","./pages/plants.js?v=161","./pages/pokemon.js?v=161","./pages/house.js?v=161","./pages/medication.js?v=161","./pages/health.js?v=161","./pages/simple.js?v=161","./pages/aquariums.js?v=161",
"./styles/base.css?v=161","./styles/home.css?v=161","./styles/journal.css?v=161","./styles/plants.css?v=161","./styles/modules.css?v=161",
"./icons/icon-192.png?v=161","./icons/icon-512.png?v=161","./icons/apple-touch-icon.png?v=161"
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
