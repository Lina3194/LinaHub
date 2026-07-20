const CACHE="linahub-v17-3-simple-shelves";
const ASSETS=[
"./","./index.html","./app.js?v=174","./manifest.webmanifest?v=174",
"./core/pokemon-seed.js?v=174","./core/data.js?v=174","./core/scheduler.js?v=174","./core/router.js?v=174","./core/cloud.js?v=174",
"./pages/home.js?v=174","./pages/today.js?v=174","./pages/todo.js?v=174","./pages/journal.js?v=174","./pages/plants.js?v=174","./pages/pokemon.js?v=174","./pages/house.js?v=174","./pages/medication.js?v=174","./pages/health.js?v=174","./pages/simple.js?v=174","./pages/aquariums.js?v=174","./pages/period.js?v=174","./pages/treasures.js?v=174",
"./styles/base.css?v=174","./styles/home.css?v=174","./styles/journal.css?v=174","./styles/plants.css?v=174","./styles/modules.css?v=174","./styles/period.css?v=174","./styles/treasures.css?v=174",
"./icons/icon-192.png?v=174","./icons/icon-512.png?v=174","./icons/apple-touch-icon.png?v=174"
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
