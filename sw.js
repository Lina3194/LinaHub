const CACHE="linahub-v14-5-fixed";
const ASSETS=[
"./","./index.html","./app.js?v=145","./manifest.webmanifest?v=145",
"./core/pokemon-seed.js?v=145","./core/data.js?v=145","./core/router.js?v=145","./core/cloud.js?v=145",
"./pages/home.js?v=145","./pages/today.js?v=145","./pages/todo.js?v=145","./pages/journal.js?v=145","./pages/plants.js?v=145","./pages/pokemon.js?v=145","./pages/house.js?v=145","./pages/medication.js?v=145","./pages/health.js?v=145","./pages/simple.js?v=145","./pages/aquariums.js?v=145",
"./styles/base.css?v=145","./styles/home.css?v=145","./styles/journal.css?v=145","./styles/plants.css?v=145","./styles/modules.css?v=145",
"./icons/icon-192.png?v=145","./icons/icon-512.png?v=145","./icons/apple-touch-icon.png?v=145"
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
