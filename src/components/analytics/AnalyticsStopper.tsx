"use client";

import { useEffect } from "react";

// Компонент для остановки аналитики на админ-роутах
// Работает даже если аналитика уже была загружена на других страницах
export function AnalyticsStopper() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const yandexId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "105401761";
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    // Останавливаем Яндекс Метрику
    if ((window as any).ym && yandexId) {
      try {
        // Пытаемся уничтожить счетчик
        (window as any).ym(Number(yandexId), 'destroy');
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    // Останавливаем Google Analytics
    if ((window as any).gtag && gaId) {
      try {
        (window as any).gtag('config', gaId, {
          send_page_view: false,
        });
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    // Удаляем скрипты аналитики из DOM
    const scripts = document.querySelectorAll(
      'script[src*="googletagmanager"], script[src*="mc.yandex.ru"]'
    );
    scripts.forEach(script => {
      script.remove();
    });

    // Удаляем noscript для Яндекс Метрики
    const noscript = document.querySelector(`noscript img[src*="${yandexId}"]`);
    if (noscript && noscript.parentElement) {
      noscript.parentElement.remove();
    }
  }, []);

  return null;
}

