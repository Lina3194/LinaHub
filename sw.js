const CACHE="linahub-v16-5-calendar-care";
const ASSETS=[
"./","./index.html","./app.js?v=162","./manifest.webmanifest?v=162",
"./core/pokemon-seed.js?v=162","./core/data.js?v=162","./core/scheduler.js?v=162","./core/router.js?v=162","./core/cloud.js?v=162",
"./pages/home.js?v=162","./pages/today.js?v=162","./pages/todo.js?v=162","./pages/journal.js?v=162","./pages/plants.js?v=162","./pages/pokemon.js?v=162","./pages/house.js?v=162","./pages/medication.js?v=162","./pages/health.js?v=162","./pages/simple.js?v=162","./pages/aquariums.js?v=162","./pages/period.js?v=162",
"./styles/base.css?v=162","./styles/home.css?v=162","./styles/journal.css?v=162","./styles/plants.css?v=162","./styles/modules.css?v=162","./styles/period.css?v=162",
"./icons/icon-192.png?v=162","./icons/icon-512.png?v=162","./icons/apple-touch-icon.png?v=162"
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
