const CACHE="linahub-v15-4-weekdays-and-module-reset";
const ASSETS=[
"./","./index.html","./app.js?v=154","./manifest.webmanifest?v=154",
"./core/pokemon-seed.js?v=154","./core/data.js?v=154","./core/router.js?v=154","./core/cloud.js?v=154",
"./pages/home.js?v=154","./pages/today.js?v=154","./pages/todo.js?v=154","./pages/journal.js?v=154","./pages/plants.js?v=154","./pages/pokemon.js?v=154","./pages/house.js?v=154","./pages/medication.js?v=154","./pages/health.js?v=154","./pages/simple.js?v=154","./pages/aquariums.js?v=154",
"./styles/base.css?v=154","./styles/home.css?v=154","./styles/journal.css?v=154","./styles/plants.css?v=154","./styles/modules.css?v=154",
"./icons/icon-192.png?v=154","./icons/icon-512.png?v=154","./icons/apple-touch-icon.png?v=154"
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
