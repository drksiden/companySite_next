/**
 * Регистрация Service Worker для PWA
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Логирование только в dev режиме
          if (process.env.NODE_ENV === 'development') {
            console.log('[SW] Service Worker registered:', registration.scope);
          }
          
          // Проверяем обновления каждые 60 секунд и принудительно обновляем кэш
          setInterval(() => {
            registration.update();
          }, 60000);
          
          // Принудительно обновляем Service Worker при изменении страницы (если доступно)
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Новый Service Worker установлен, перезагружаем страницу для активации
                  if (process.env.NODE_ENV === 'development') {
                    console.log('[SW] New service worker installed, reloading...');
                  }
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          // Логирование ошибок только в dev режиме
          if (process.env.NODE_ENV === 'development') {
            console.error('[SW] Service Worker registration failed:', error);
          }
        });
    });
  }
}

