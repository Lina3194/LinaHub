const CACHE="linahub-v14-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=140","./manifest.webmanifest?v=140",
"./core/pokemon-seed.js?v=140","./core/data.js?v=140","./core/router.js?v=140","./core/cloud.js?v=140",
"./pages/home.js?v=140","./pages/today.js?v=140","./pages/todo.js?v=140","./pages/journal.js?v=140","./pages/plants.js?v=140","./pages/pokemon.js?v=140","./pages/house.js?v=140","./pages/medication.js?v=140","./pages/health.js?v=140","./pages/simple.js?v=140","./pages/aquariums.js?v=140",
"./styles/base.css?v=140","./styles/home.css?v=140","./styles/journal.css?v=140","./styles/plants.css?v=140","./styles/modules.css?v=140",
"./icons/icon-192.png?v=140","./icons/icon-512.png?v=140","./icons/apple-touch-icon.png?v=140"
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
