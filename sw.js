const CACHE="linahub-v5-2-cleanfull";
const ASSETS=[
"./","./index.html","./app.js?v=52","./manifest.webmanifest?v=52",
"./core/data.js?v=52","./core/router.js?v=52",
"./pages/home.js?v=52","./pages/journal.js?v=52","./pages/plants.js?v=52","./pages/simple.js?v=52",
"./styles/base.css?v=52","./styles/home.css?v=52","./styles/journal.css?v=52","./styles/plants.css?v=52",
"./icons/icon-192.png?v=52","./icons/icon-512.png?v=52","./icons/apple-touch-icon.png?v=52"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  if(e.request.mode==="navigate"){
    e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
