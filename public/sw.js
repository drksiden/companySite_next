// Service Worker для PWA
// Обновляем версию кэша при каждом изменении для принудительного обновления
const CACHE_NAME = 'asia-ntb-v2';
const RUNTIME_CACHE = 'asia-ntb-runtime-v2';

// Ресурсы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/catalog',
  '/about',
  '/services',
  '/contacts',
  '/news',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Логирование только в dev режиме
        if (typeof self !== 'undefined' && self.location && self.location.hostname === 'localhost') {
          console.log('[SW] Pre-caching offline page');
        }
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            // Логирование только в dev режиме
            if (typeof self !== 'undefined' && self.location && self.location.hostname === 'localhost') {
              console.log('[SW] Removing old cache', cacheName);
            }
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Пропускаем не-GET запросы
  if (event.request.method !== 'GET') {
    return;
  }

  // Пропускаем запросы к API, админке, внешним ресурсам и аналитике
  const url = new URL(event.request.url);
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/admin') ||
    event.request.url.includes('/_next/') ||
    url.origin !== self.location.origin ||
    event.request.url.includes('mc.yandex.ru') ||
    event.request.url.includes('google-analytics') ||
    event.request.url.includes('googletagmanager')
  ) {
    return;
  }

  event.respondWith(
    // Используем стратегию Network First для HTML страниц - всегда проверяем сеть сначала
    fetch(event.request)
      .then((response) => {
        // Если запрос успешен, обновляем кэш и возвращаем свежий ответ
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Если сеть недоступна, пытаемся вернуть из кэша
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Если сеть недоступна и нет кэша, возвращаем офлайн-страницу для документов
          if (event.request.destination === 'document') {
            return caches.match('/').then((offlinePage) => {
              return offlinePage || new Response('Offline', { status: 503 });
            });
          }
          // Для других ресурсов возвращаем пустой ответ
          return new Response('', { status: 503 });
        });
      })
  );
});

