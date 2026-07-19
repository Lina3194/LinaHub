const CACHE="linahub-v14-7-health-compact";
const ASSETS=[
"./","./index.html","./app.js?v=148","./manifest.webmanifest?v=148",
"./core/pokemon-seed.js?v=148","./core/data.js?v=148","./core/router.js?v=148","./core/cloud.js?v=148",
"./pages/home.js?v=148","./pages/today.js?v=148","./pages/todo.js?v=148","./pages/journal.js?v=148","./pages/plants.js?v=148","./pages/pokemon.js?v=148","./pages/house.js?v=148","./pages/medication.js?v=148","./pages/health.js?v=148","./pages/simple.js?v=148","./pages/aquariums.js?v=148",
"./styles/base.css?v=148","./styles/home.css?v=148","./styles/journal.css?v=148","./styles/plants.css?v=148","./styles/modules.css?v=148",
"./icons/icon-192.png?v=148","./icons/icon-512.png?v=148","./icons/apple-touch-icon.png?v=148"
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
