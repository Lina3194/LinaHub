const CACHE="linahub-v14-2-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=142","./manifest.webmanifest?v=142",
"./core/pokemon-seed.js?v=142","./core/data.js?v=142","./core/router.js?v=142","./core/cloud.js?v=142",
"./pages/home.js?v=142","./pages/today.js?v=142","./pages/todo.js?v=142","./pages/journal.js?v=142","./pages/plants.js?v=142","./pages/pokemon.js?v=142","./pages/house.js?v=142","./pages/medication.js?v=142","./pages/health.js?v=142","./pages/simple.js?v=142","./pages/aquariums.js?v=142",
"./styles/base.css?v=142","./styles/home.css?v=142","./styles/journal.css?v=142","./styles/plants.css?v=142","./styles/modules.css?v=142",
"./icons/icon-192.png?v=142","./icons/icon-512.png?v=142","./icons/apple-touch-icon.png?v=142"
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
