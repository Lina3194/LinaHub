const CACHE="linahub-v15-8-navigation-themes";
const ASSETS=[
"./","./index.html","./app.js?v=158","./manifest.webmanifest?v=158",
"./core/pokemon-seed.js?v=158","./core/data.js?v=158","./core/router.js?v=158","./core/cloud.js?v=158",
"./pages/home.js?v=158","./pages/today.js?v=158","./pages/todo.js?v=158","./pages/journal.js?v=158","./pages/plants.js?v=158","./pages/pokemon.js?v=158","./pages/house.js?v=158","./pages/medication.js?v=158","./pages/health.js?v=158","./pages/simple.js?v=158","./pages/aquariums.js?v=158","./pages/period.js?v=158","./pages/treasures.js?v=158",
"./styles/base.css?v=158","./styles/home.css?v=158","./styles/journal.css?v=158","./styles/plants.css?v=158","./styles/modules.css?v=158","./styles/period.css?v=158","./styles/treasures.css?v=158",
"./icons/icon-192.png?v=158","./icons/icon-512.png?v=158","./icons/apple-touch-icon.png?v=158"
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
