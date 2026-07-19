const CACHE="linahub-v13-3-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=133","./manifest.webmanifest?v=133",
"./core/pokemon-seed.js?v=133","./core/data.js?v=133","./core/router.js?v=133","./core/cloud.js?v=133",
"./pages/home.js?v=133","./pages/today.js?v=133","./pages/todo.js?v=133","./pages/journal.js?v=133","./pages/plants.js?v=133","./pages/pokemon.js?v=133","./pages/house.js?v=133","./pages/medication.js?v=133","./pages/health.js?v=133","./pages/simple.js?v=133","./pages/aquariums.js?v=133",
"./styles/base.css?v=133","./styles/home.css?v=133","./styles/journal.css?v=133","./styles/plants.css?v=133","./styles/modules.css?v=133",
"./icons/icon-192.png?v=133","./icons/icon-512.png?v=133","./icons/apple-touch-icon.png?v=133"
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
