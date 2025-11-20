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
          
          // Проверяем обновления каждые 60 секунд
          setInterval(() => {
            registration.update();
          }, 60000);
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

