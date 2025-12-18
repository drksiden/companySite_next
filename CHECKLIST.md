# Чеклист перед деплоем на хостинг

## ✅ Билд
- [x] Билд успешный (✓ Compiled successfully)
- [x] Только warnings (не критично)
- [x] Все страницы сгенерированы (71/71)

## ✅ Favicon
- [x] Файлы скопированы в `public/`:
  - favicon.ico
  - icon0.svg
  - icon1.png
  - apple-icon.png
- [x] Настроены в `layout.tsx` (metadata.icons)
- [x] Настроены в `head.tsx` (link tags)
- [x] Manifest.json настроен

**Для Google Search Console:**
1. Убедитесь, что файлы доступны по URL:
   - https://asia-ntb.kz/favicon.ico
   - https://asia-ntb.kz/icon0.svg
   - https://asia-ntb.kz/apple-icon.png
2. Проверьте в Google Search Console → Настройки → Favicon
3. Очистите кэш Google (может занять несколько дней)

## ✅ Логирование
- [x] Winston настроен
- [x] winston-loki интегрирован
- [x] Клиентское логирование настроено
- [x] Серверное логирование настроено
- [x] Все ошибки логируются:
  - ErrorBoundary
  - global-error.tsx
  - error.tsx
  - useOptimizedFetch
  - CatalogContext
  - React Query
  - API routes
  - Forms
  - Images

**Для работы логирования на хостинге:**
1. Добавьте в `.env` на сервере:
   ```env
   GRAFANA_LOKI_URL=https://logs-prod-XXX.grafana.net/loki/api/v1/push
   GRAFANA_LOKI_LABELS={"app":"company-site-next","environment":"production"}
   GRAFANA_LOKI_BASIC_AUTH=YOUR_INSTANCE_ID:YOUR_API_TOKEN
   LOG_LEVEL=info
   NEXT_PUBLIC_ENABLE_CLIENT_LOGGING=true
   ```
2. Перезапустите приложение

## ✅ Кеширование
- [x] Middleware настроен
- [x] Статические ресурсы кешируются (1 год)
- [x] Изображения кешируются (1 час)
- [x] HTML страницы НЕ кешируются (no-store)
- [x] API routes НЕ кешируются (no-store)
- [x] Service Worker настроен
- [x] React Query кеширование настроено

## ⚠️ Warnings (не критично, но можно исправить)
- React Hook dependencies
- Unescaped entities
- img вместо Image компонента

## 📝 Следующие шаги
1. Загрузите на хостинг
2. Настройте переменные окружения (см. `.env.example`)
3. Проверьте favicon в Google Search Console
4. Проверьте логи в Grafana Cloud
