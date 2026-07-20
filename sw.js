const CACHE="linahub-v3-0-enchanted-sanctuary";
const ASSETS=[
"./","./index.html","./app.js?v=300","./manifest.webmanifest?v=300",
"./core/pokemon-seed.js?v=300","./core/data.js?v=300","./core/scheduler.js?v=300","./core/router.js?v=300","./core/cloud.js?v=300",
"./pages/home.js?v=300","./pages/today.js?v=300","./pages/todo.js?v=300","./pages/journal.js?v=300","./pages/plants.js?v=300","./pages/pokemon.js?v=300","./pages/house.js?v=300","./pages/medication.js?v=300","./pages/health.js?v=300","./pages/simple.js?v=300","./pages/aquariums.js?v=300","./pages/period.js?v=300","./pages/treasures.js?v=300",
"./styles/base.css?v=300","./styles/home.css?v=300","./styles/journal.css?v=300","./styles/plants.css?v=300","./styles/modules.css?v=300","./styles/period.css?v=300","./styles/treasures.css?v=300",
"./icons/icon-192.png?v=300","./icons/icon-512.png?v=300","./icons/apple-touch-icon.png?v=300"
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
