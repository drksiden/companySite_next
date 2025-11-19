"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

export function Analytics() {
  const pathname = usePathname();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  // ID вашего счетчика Яндекс Метрики: 105401761
  const yandexId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "105401761";

  // Google Analytics
  useEffect(() => {
    if (!gaId) return;

    // Инициализация GA
    if (typeof window !== "undefined" && !window.gtag) {
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script1);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        if (window.dataLayer) {
          window.dataLayer.push(arguments);
        }
      };
      window.gtag("js", new Date());
      window.gtag("config", gaId, {
        page_path: pathname,
      });
    } else if (window.gtag) {
      // Обновляем путь при навигации
      window.gtag("config", gaId, {
        page_path: pathname,
      });
    }
  }, [pathname, gaId]);

  // Yandex Metrika - используем официальный код от Яндекс
  useEffect(() => {
    if (typeof window === "undefined") return;

    const metrikaId = Number(yandexId);

    // Проверяем, не загружен ли уже скрипт
    const existingScript = Array.from(document.scripts).find(
      (script) => script.src.includes(`mc.yandex.ru/metrika/tag.js?id=${yandexId}`)
    );

    if (existingScript) {
      // Если скрипт уже загружен, просто отправляем hit при навигации
      if (window.ym) {
        window.ym(metrikaId, "hit", pathname);
      }
      return;
    }

    // Инициализируем ym функцию (официальный код от Яндекс)
    if (!window.ym) {
      (window as any).ym = function (...args: any[]) {
        ((window as any).ym.a = (window as any).ym.a || []).push(args);
      };
      (window as any).ym.l = Date.now();
    }

    // Создаем и загружаем скрипт (официальный код от Яндекс)
    (function(m: any, e: Document, t: string, r: string, i: string) {
      m[i] = m[i] || function(...args: any[]) {
        (m[i].a = m[i].a || []).push(args);
      };
      m[i].l = Date.now();
      
      // Проверяем, не загружен ли уже скрипт
      for (let j = 0; j < document.scripts.length; j++) {
        if (document.scripts[j].src === r) {
          return;
        }
      }
      
      const k = e.createElement(t) as HTMLScriptElement;
      const a = e.getElementsByTagName(t)[0] as HTMLScriptElement;
      k.async = true;
      k.src = r;
      if (a && a.parentNode) {
        a.parentNode.insertBefore(k, a);
      }
    })(window, document, "script", `https://mc.yandex.ru/metrika/tag.js?id=${yandexId}`, "ym");

    // Инициализируем счетчик с настройками из Яндекс Метрики
    if (window.ym) {
      window.ym(metrikaId, "init", {
        ssr: true,
        webvisor: true,
        clickmap: true,
        ecommerce: "dataLayer",
        accurateTrackBounce: true,
        trackLinks: true,
      });
    }

    // Добавляем noscript для Yandex Metrika (если еще не добавлен)
    if (!document.querySelector(`noscript img[src*="${yandexId}"]`)) {
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${yandexId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
      document.body.appendChild(noscript);
    }
  }, []); // Загружаем только один раз при монтировании

  // Отправляем hit при изменении пути (для SPA навигации)
  useEffect(() => {
    if (window.ym && yandexId) {
      window.ym(Number(yandexId), "hit", pathname);
    }
  }, [pathname, yandexId]);

  return null;
}
