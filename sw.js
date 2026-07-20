const CACHE="linahub-v15-5-restored-2026-07-20";
const ASSETS=[
"./","./index.html","./app.js?v=155","./manifest.webmanifest?v=155",
"./core/pokemon-seed.js?v=155","./core/data.js?v=155","./core/router.js?v=155","./core/cloud.js?v=155",
"./pages/home.js?v=155","./pages/today.js?v=155","./pages/todo.js?v=155","./pages/journal.js?v=155","./pages/plants.js?v=155","./pages/pokemon.js?v=155","./pages/house.js?v=155","./pages/medication.js?v=155","./pages/health.js?v=155","./pages/simple.js?v=155","./pages/aquariums.js?v=155",
"./styles/base.css?v=155","./styles/home.css?v=155","./styles/journal.css?v=155","./styles/plants.css?v=155","./styles/modules.css?v=155",
"./icons/icon-192.png?v=155","./icons/icon-512.png?v=155","./icons/apple-touch-icon.png?v=155"
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
