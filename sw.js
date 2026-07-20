const CACHE="linahub-v15-7-clean-rebuild";
const ASSETS=[
"./","./index.html","./app.js?v=157","./manifest.webmanifest?v=157",
"./core/pokemon-seed.js?v=157","./core/data.js?v=157","./core/router.js?v=157","./core/cloud.js?v=157",
"./pages/home.js?v=157","./pages/today.js?v=157","./pages/todo.js?v=157","./pages/journal.js?v=157","./pages/plants.js?v=157","./pages/pokemon.js?v=157","./pages/house.js?v=157","./pages/medication.js?v=157","./pages/health.js?v=157","./pages/simple.js?v=157","./pages/aquariums.js?v=157","./pages/period.js?v=157","./pages/treasures.js?v=157",
"./styles/base.css?v=157","./styles/home.css?v=157","./styles/journal.css?v=157","./styles/plants.css?v=157","./styles/modules.css?v=157","./styles/period.css?v=157","./styles/treasures.css?v=157",
"./icons/icon-192.png?v=157","./icons/icon-512.png?v=157","./icons/apple-touch-icon.png?v=157"
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
