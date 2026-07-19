const CACHE="linahub-v14-1-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=141","./manifest.webmanifest?v=141",
"./core/pokemon-seed.js?v=141","./core/data.js?v=141","./core/router.js?v=141","./core/cloud.js?v=141",
"./pages/home.js?v=141","./pages/today.js?v=141","./pages/todo.js?v=141","./pages/journal.js?v=141","./pages/plants.js?v=141","./pages/pokemon.js?v=141","./pages/house.js?v=141","./pages/medication.js?v=141","./pages/health.js?v=141","./pages/simple.js?v=141","./pages/aquariums.js?v=141",
"./styles/base.css?v=141","./styles/home.css?v=141","./styles/journal.css?v=141","./styles/plants.css?v=141","./styles/modules.css?v=141",
"./icons/icon-192.png?v=141","./icons/icon-512.png?v=141","./icons/apple-touch-icon.png?v=141"
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
