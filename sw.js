const CACHE="linahub-v13-7-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=137","./manifest.webmanifest?v=137",
"./core/pokemon-seed.js?v=137","./core/data.js?v=137","./core/router.js?v=137","./core/cloud.js?v=137",
"./pages/home.js?v=137","./pages/today.js?v=137","./pages/todo.js?v=137","./pages/journal.js?v=137","./pages/plants.js?v=137","./pages/pokemon.js?v=137","./pages/house.js?v=137","./pages/medication.js?v=137","./pages/health.js?v=137","./pages/simple.js?v=137","./pages/aquariums.js?v=137",
"./styles/base.css?v=137","./styles/home.css?v=137","./styles/journal.css?v=137","./styles/plants.css?v=137","./styles/modules.css?v=137",
"./icons/icon-192.png?v=137","./icons/icon-512.png?v=137","./icons/apple-touch-icon.png?v=137"
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
