const CACHE="linahub-v13-6-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=136","./manifest.webmanifest?v=136",
"./core/pokemon-seed.js?v=136","./core/data.js?v=136","./core/router.js?v=136","./core/cloud.js?v=136",
"./pages/home.js?v=136","./pages/today.js?v=136","./pages/todo.js?v=136","./pages/journal.js?v=136","./pages/plants.js?v=136","./pages/pokemon.js?v=136","./pages/house.js?v=136","./pages/medication.js?v=136","./pages/health.js?v=136","./pages/simple.js?v=136","./pages/aquariums.js?v=136",
"./styles/base.css?v=136","./styles/home.css?v=136","./styles/journal.css?v=136","./styles/plants.css?v=136","./styles/modules.css?v=136",
"./icons/icon-192.png?v=136","./icons/icon-512.png?v=136","./icons/apple-touch-icon.png?v=136"
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
