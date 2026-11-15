/* ===== Veust FitLog — désactivation du service worker =====
   La version précédente bloquait les mises à jour des pages (elle servait d'anciennes copies).
   Ce fichier se remplace à elle, vide tous ses caches et se désinstalle.
   L'appli fonctionne ensuite normalement, directement depuis GitHub. */
self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.map(k=>caches.delete(k)));
    await self.registration.unregister();
  })());
});
