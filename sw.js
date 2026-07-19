const CACHE="linahub-v15-1-medication-force-refresh";
const ASSETS=[
"./","./index.html","./app.js?v=151","./manifest.webmanifest?v=151",
"./core/pokemon-seed.js?v=151","./core/data.js?v=151","./core/router.js?v=151","./core/cloud.js?v=151",
"./pages/home.js?v=151","./pages/today.js?v=151","./pages/todo.js?v=151","./pages/journal.js?v=151","./pages/plants.js?v=151","./pages/pokemon.js?v=151","./pages/house.js?v=151","./pages/medication.js?v=151","./pages/health.js?v=151","./pages/simple.js?v=151","./pages/aquariums.js?v=151",
"./styles/base.css?v=151","./styles/home.css?v=151","./styles/journal.css?v=151","./styles/plants.css?v=151","./styles/modules.css?v=151",
"./icons/icon-192.png?v=151","./icons/icon-512.png?v=151","./icons/apple-touch-icon.png?v=151"
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
