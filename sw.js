const BUILD_VERSION = "linahub-v17.9.10";
const CACHE = BUILD_VERSION;
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest?v=1801",
  "./icons/favicon.png?v=1801",
  "./icons/apple-touch-icon.png?v=1801",
  "./icons/icon-192.png?v=1801",
  "./icons/icon-512.png?v=1801",
  "./icons/pokemon.svg?v=1801",
  "./styles/base.css?v=1801",
  "./styles/home.css?v=1801",
  "./styles/journal.css?v=1801",
  "./styles/plants.css?v=1801",
  "./styles/modules.css?v=1801",
  "./styles/period.css?v=1801",
  "./styles/treasures.css?v=1801",
  "./styles/phone-final-fixes.css?v=1801",
  "./styles/phone-ui-1714.css?v=1801",
  "./styles/phone-ui-1715.css?v=1801",
  "./styles/medication-phone-1730.css?v=1801",
  "./styles/exact-fixes-1732.css?v=1801",
  "./styles/medication-1733.css?v=1801",
  "./core/pokemon-seed.js?v=1801",
  "./core/media.js?v=1801",
  "./core/data.js?v=1801",
  "./core/router.js?v=1801",
  "./core/cloud.js?v=1801",
  "./pages/home.js?v=1801",
  "./pages/today.js?v=1801",
  "./pages/todo.js?v=1801",
  "./pages/shopping.js?v=1801",
  "./pages/hobbies.js?v=1801",
  "./pages/books.js?v=1801",
  "./pages/journal.js?v=1801",
  "./pages/plants.js?v=1801",
  "./pages/pokemon.js?v=1801",
  "./pages/house.js?v=1801",
  "./pages/medication.js?v=1801",
  "./pages/health.js?v=1801",
  "./pages/simple.js?v=1801",
  "./pages/aquariums.js?v=1801",
  "./pages/period.js?v=1801",
  "./pages/treasures.js?v=1801",
  "./pages/budget.js?v=1801",
  "./pages/history.js?v=1801",
  "./app.js?v=1801",
  "./ui-1714.js?v=1801"
];

self.addEventListener("install",event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(url.origin!==location.origin) return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));
    return;
  }
  if(["script","style"].includes(event.request.destination)){
    event.respondWith(fetch(event.request,{cache:"no-store"}).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request)));
});
self.addEventListener("notificationclick",event=>{
  event.notification.close();
  const target="./"+(event.notification.data?.route?`#${event.notification.data.route}`:"");
  event.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if("focus" in client){client.postMessage({type:"LINAHUB_ROUTE",route:event.notification.data?.route||"home"});return client.focus()}
    }
    return clients.openWindow?clients.openWindow(target):undefined;
  }));
});
