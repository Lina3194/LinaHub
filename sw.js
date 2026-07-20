const CACHE="linahub-v16-10-centered-treasure-hints-fix";
const ASSETS=[
"./","./index.html","./app.js?v=1610","./manifest.webmanifest?v=1610",
"./core/pokemon-seed.js?v=1610","./core/data.js?v=1610","./core/router.js?v=1610","./core/cloud.js?v=1610",
"./pages/home.js?v=1610","./pages/today.js?v=1610","./pages/todo.js?v=1610","./pages/journal.js?v=1610","./pages/plants.js?v=1610","./pages/pokemon.js?v=1610","./pages/house.js?v=1610","./pages/medication.js?v=1610","./pages/health.js?v=1610","./pages/simple.js?v=1610","./pages/aquariums.js?v=1610","./pages/period.js?v=1610","./pages/treasures.js?v=1610",
"./styles/base.css?v=1610","./styles/home.css?v=1610","./styles/journal.css?v=1610","./styles/plants.css?v=1610","./styles/modules.css?v=1610","./styles/period.css?v=1610","./styles/treasures.css?v=1610",
"./icons/icon-192.png?v=1610","./icons/icon-512.png?v=1610","./icons/apple-touch-icon.png?v=1610"
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
