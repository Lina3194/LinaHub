const CACHE="linahub-v16-3-personal-keepsakes";
const ASSETS=[
"./","./index.html","./app.js?v=160","./manifest.webmanifest?v=160",
"./core/pokemon-seed.js?v=160","./core/data.js?v=160","./core/router.js?v=160","./core/cloud.js?v=160",
"./pages/home.js?v=160","./pages/today.js?v=160","./pages/todo.js?v=160","./pages/journal.js?v=160","./pages/plants.js?v=160","./pages/pokemon.js?v=160","./pages/house.js?v=160","./pages/medication.js?v=160","./pages/health.js?v=160","./pages/simple.js?v=160","./pages/aquariums.js?v=160","./pages/period.js?v=160","./pages/treasures.js?v=160",
"./styles/base.css?v=160","./styles/home.css?v=160","./styles/journal.css?v=160","./styles/plants.css?v=160","./styles/modules.css?v=160","./styles/period.css?v=160","./styles/treasures.css?v=160",
"./icons/icon-192.png?v=160","./icons/icon-512.png?v=160","./icons/apple-touch-icon.png?v=160"
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
