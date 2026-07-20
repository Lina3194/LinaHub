const CACHE="linahub-v16-4-centered-treasure-modal";
const ASSETS=[
"./","./index.html","./app.js?v=164","./manifest.webmanifest?v=164",
"./core/pokemon-seed.js?v=164","./core/data.js?v=164","./core/router.js?v=164","./core/cloud.js?v=164",
"./pages/home.js?v=164","./pages/today.js?v=164","./pages/todo.js?v=164","./pages/journal.js?v=164","./pages/plants.js?v=164","./pages/pokemon.js?v=164","./pages/house.js?v=164","./pages/medication.js?v=164","./pages/health.js?v=164","./pages/simple.js?v=164","./pages/aquariums.js?v=164","./pages/period.js?v=164","./pages/treasures.js?v=164",
"./styles/base.css?v=164","./styles/home.css?v=164","./styles/journal.css?v=164","./styles/plants.css?v=164","./styles/modules.css?v=164","./styles/period.css?v=164","./styles/treasures.css?v=164",
"./icons/icon-192.png?v=164","./icons/icon-512.png?v=164","./icons/apple-touch-icon.png?v=164"
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
