/* ===== Veust FitLog — service worker =====
   Réseau d'abord : tu as toujours la dernière version mise sur GitHub quand tu as du réseau,
   et la dernière version enregistrée quand tu n'en as pas (salle de sport sans réseau).
   Les appels à l'API GitHub (autre domaine) ne passent jamais par ce cache. */
const CACHE="veust-fitlog-v3";
const FILES=["./","index.html","coach.html","stats.html","common.js","animations.js","style.css",
  "historique.json","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png","favicon.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:"reload"})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==self.location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const res=await fetch(req,{cache:"no-store"});
      if(res&&res.ok){const key=url.origin+url.pathname;cache.put(key,res.clone())}
      return res;
    }catch(err){
      const hit=await cache.match(url.origin+url.pathname,{ignoreSearch:true})||await cache.match(req,{ignoreSearch:true});
      if(hit)return hit;
      if(req.mode==="navigate"){const idx=await cache.match("index.html",{ignoreSearch:true});if(idx)return idx}
      throw err;
    }
  })());
});
