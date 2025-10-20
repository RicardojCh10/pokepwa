/* eslint-env serviceworker */

const CACHE_NAME = 'pokedex-cache-v1';
const API_CACHE_NAME = 'pokedex-api-cache-v1';

// Recursos estáticos para cachear
const urlsToCache = [
  '/',
  '/index.html',
  // Puedes añadir aquí tus archivos JS y CSS si no usas un CDN
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// 1. Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Eliminar caches antiguas si existen
          return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Interceptación de peticiones (Fetch)
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Estrategia: Cache First para la API de Pokémon
  if (url.hostname === 'pokeapi.co') {
    event.respondWith(cacheFirstWithNetworkUpdate(request));
  } 
  // Estrategia: Cache First para recursos estáticos
  else {
    event.respondWith(
      caches.match(request)
        .then(response => {
          // Si está en cache, lo devuelve. Si no, va a la red.
          return response || fetch(request);
        })
    );
  }
});

// Función de estrategia de caché: "Cache First, then Network"
async function cacheFirstWithNetworkUpdate(request) {
  const apiCache = await caches.open(API_CACHE_NAME);
  
  // 1. Intenta obtener desde el caché
  const cachedResponse = await apiCache.match(request);
  
  // 2. Mientras tanto, siempre pide a la red para actualizar el caché
  const networkFetch = fetch(request).then(networkResponse => {
    // Si la respuesta es válida, la clona y la guarda en caché
    if (networkResponse && networkResponse.status === 200) {
      apiCache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(err => {
    console.error('Error al obtener de la red:', err);
    // No hacer nada si la red falla, nos quedamos con el caché si existe
  });

  // Devuelve la respuesta del caché si existe, si no, espera a la respuesta de la red.
  return cachedResponse || networkFetch;
}
