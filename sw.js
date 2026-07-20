const CACHE="linahub-v17-3-simple-shelves";
const ASSETS=[
"./","./index.html","./app.js?v=173","./manifest.webmanifest?v=173",
"./core/pokemon-seed.js?v=173","./core/data.js?v=173","./core/scheduler.js?v=173","./core/router.js?v=173","./core/cloud.js?v=173",
"./pages/home.js?v=173","./pages/today.js?v=173","./pages/todo.js?v=173","./pages/journal.js?v=173","./pages/plants.js?v=173","./pages/pokemon.js?v=173","./pages/house.js?v=173","./pages/medication.js?v=173","./pages/health.js?v=173","./pages/simple.js?v=173","./pages/aquariums.js?v=173","./pages/period.js?v=173","./pages/treasures.js?v=173",
"./styles/base.css?v=173","./styles/home.css?v=173","./styles/journal.css?v=173","./styles/plants.css?v=173","./styles/modules.css?v=173","./styles/period.css?v=173","./styles/treasures.css?v=173",
"./icons/icon-192.png?v=173","./icons/icon-512.png?v=173","./icons/apple-touch-icon.png?v=173"
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
