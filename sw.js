const CACHE="linahub-v13-cloud";
const ASSETS=[
"./","./index.html","./app.js?v=130","./manifest.webmanifest?v=130",
"./core/pokemon-seed.js?v=130","./core/data.js?v=130","./core/router.js?v=130","./core/cloud.js?v=130",
"./pages/home.js?v=130","./pages/today.js?v=130","./pages/todo.js?v=130","./pages/journal.js?v=130","./pages/plants.js?v=130","./pages/pokemon.js?v=130","./pages/house.js?v=130","./pages/medication.js?v=130","./pages/health.js?v=130","./pages/simple.js?v=130","./pages/aquariums.js?v=130",
"./styles/base.css?v=130","./styles/home.css?v=130","./styles/journal.css?v=130","./styles/plants.css?v=130","./styles/modules.css?v=130",
"./icons/icon-192.png?v=130","./icons/icon-512.png?v=130","./icons/apple-touch-icon.png?v=130"
];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin) return;
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request,{cache:"no-store"}).catch(()=>caches.match("./index.html")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
