const CACHE="linahub-v14-3-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=143","./manifest.webmanifest?v=143",
"./core/pokemon-seed.js?v=143","./core/data.js?v=143","./core/router.js?v=143","./core/cloud.js?v=143",
"./pages/home.js?v=143","./pages/today.js?v=143","./pages/todo.js?v=143","./pages/journal.js?v=143","./pages/plants.js?v=143","./pages/pokemon.js?v=143","./pages/house.js?v=143","./pages/medication.js?v=143","./pages/health.js?v=143","./pages/simple.js?v=143","./pages/aquariums.js?v=143",
"./styles/base.css?v=143","./styles/home.css?v=143","./styles/journal.css?v=143","./styles/plants.css?v=143","./styles/modules.css?v=143",
"./icons/icon-192.png?v=143","./icons/icon-512.png?v=143","./icons/apple-touch-icon.png?v=143"
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
