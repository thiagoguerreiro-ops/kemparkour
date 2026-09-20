// Service worker do Kem Parkour: guarda o jogo no celular pra funcionar sem
// internet depois da primeira visita.
//
// Pra publicar uma atualização (GitHub Pages), SEMPRE em dois passos:
//   1. `node tools/build-sw-list.mjs`   (refaz precache.json, se algum
//      arquivo do jogo mudou de nome ou foi criado/apagado)
//   2. Suba o número de VERSION aqui embaixo (ex.: 'v1' -> 'v2')
// O número novo cria um cache novo; o `activate` apaga o cache antigo; e
// `skipWaiting` + `clients.claim` fazem o celular do Arthur trocar pra
// versão nova assim que ele abrir o jogo de novo — sem ficar preso numa
// versão velha.
const VERSION = 'v13';
const CACHE_NAME = `kem-parkour-${VERSION}`;
const PRECACHE_URL = './precache.json';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const res = await fetch(PRECACHE_URL, { cache: 'no-store' });
      const urls = await res.json();
      await cache.addAll(urls);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

// Cache-first: se já baixou, serve do cache (funciona offline). Se não
// achou, busca na rede e guarda uma cópia pra próxima vez.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const fresh = await fetch(event.request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const fallback = await caches.match('./index.html');
        if (fallback) return fallback;
        throw err;
      }
    })(),
  );
});
