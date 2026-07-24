const BUILD_VERSION = 'linahub-v17.0';
/* LinaHub 17.0 */
const CACHE="linahub-v17-0-2";
const ASSETS=[
"./","./index.html","./app.js?v=1702","./manifest.webmanifest?v=1702",
"./core/pokemon-seed.js?v=1702","./core/data.js?v=1702","./core/router.js?v=1702","./core/cloud.js?v=1702",
"./pages/home.js?v=1702","./pages/today.js?v=1702","./pages/todo.js?v=1702","./pages/shopping.js?v=1702","./pages/hobbies.js?v=1702","./pages/books.js?v=1702","./pages/journal.js?v=1702","./pages/plants.js?v=1702","./pages/pokemon.js?v=1702","./pages/house.js?v=1702","./pages/medication.js?v=1702","./pages/health.js?v=1702","./pages/simple.js?v=1702","./pages/aquariums.js?v=1702","./pages/period.js?v=1702","./pages/treasures.js?v=1702","./pages/budget.js?v=1702",
"./styles/base.css?v=1702","./styles/home.css?v=1702","./styles/journal.css?v=1702","./styles/plants.css?v=1702","./styles/modules.css?v=1702","./styles/period.css?v=1702","./styles/treasures.css?v=1702",
"./icons/icon-192.png?v=1702","./icons/icon-512.png?v=1702","./icons/apple-touch-icon.png?v=1702"
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

self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target="./"+(event.notification.data?.route?`#${event.notification.data.route}`:"");
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){if("focus" in client){client.postMessage({type:"LINAHUB_ROUTE",route:event.notification.data?.route||"home"});return client.focus();}}
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});
