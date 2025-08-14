# ПЛАН ДЕЙСТВИЙ ПО ЗАВЕРШЕНИЮ РЕФАКТОРИНГА

## 🎯 Цель
Завершить рефакторинг Next.js 14 проекта согласно техническому заданию: упростить структуру, убрать дубли, настроить R2, стабилизировать каталог.

## 📊 Текущий статус
- ✅ Архитектура проекта правильная
- ✅ TypeScript strict mode включен
- ✅ Supabase клиенты унифицированы
- ✅ R2 интеграция готова (код)
- ✅ Сервисный слой каталога настроен
- ⚠️ Нужны переменные окружения R2
- ⚠️ Есть неиспользуемые файлы-дубликаты

## 🚀 ПЛАН ДЕЙСТВИЙ

### Этап 1: Настройка окружения (КРИТИЧНО)

#### 1.1 Настроить переменные R2 в .env.local
```bash
# Добавить в .env.local:
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_BUCKET=your-bucket-name
R2_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
R2_UPLOAD_MAX_MB=20
```

#### 1.2 Проверить Supabase переменные
```bash
# Убедиться что есть в .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (для admin API)
```

### Этап 2: Удаление дубликатов (РЕКОМЕНДУЕТСЯ)

#### 2.1 Удалить неиспользуемые компоненты каталога
```bash
rm src/components/catalog/CatalogPage.tsx
rm src/components/catalog/EnhancedProductDetailPage.tsx
```

#### 2.2 Удалить старые компоненты загрузки изображений
```bash
rm src/components/ImageUpload.tsx
rm src/components/ImageUploadOptimized.tsx
```

#### 2.3 Проверить и удалить другие дубликаты
```bash
# Найти файлы, которые не импортируются:
find src -name "*.tsx" -o -name "*.ts" | while read file; do
  basename=$(basename "$file" .tsx .ts)
  if ! grep -r "from.*$basename\|import.*$basename" src/ >/dev/null 2>&1; then
    echo "Potentially unused: $file"
  fi
done
```

### Этап 3: Проверка функциональности

#### 3.1 Запустить dev сервер
```bash
pnpm dev
```

#### 3.2 Тестирование API каталога
```bash
# Запустить тест-скрипт:
node test-catalog-quick.js

# Или ручно:
curl http://localhost:3000/api/catalog/products?page=1&limit=5
curl http://localhost:3000/api/catalog/brands
curl http://localhost:3000/api/catalog/categories
```

#### 3.3 Тестирование страниц
- Открыть http://localhost:3000/catalog
- Проверить фильтры и сортировку
- Перейти на страницу товара
- Проверить загрузку изображений

#### 3.4 Тестирование загрузки в R2
```bash
# Создать тестовый файл и загрузить:
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.jpg","contentType":"image/jpeg"}'
```

### Этап 4: Исправление проблем

#### 4.1 Если не работает каталог
- Проверить миграции Supabase: `supabase db status`
- Применить миграции: `supabase db push`
- Проверить RLS политики для public access

#### 4.2 Если не работает загрузка R2
- Проверить CORS настройки бакета
- Проверить публичный доступ к бакету
- Протестировать presigned URL вручную

#### 4.3 Если ошибки типов
```bash
# Проверить типы:
pnpm typecheck

# Исправить конфликты в types/supabase.ts vs services/catalog.ts
```

### Этап 5: Оптимизация (ОПЦИОНАЛЬНО)

#### 5.1 Исправить ESLint warnings
```bash
# Основные проблемы:
# - react-hooks/exhaustive-deps
# - @next/next/no-html-link-for-pages
# - @next/next/no-img-element

pnpm lint:fix
```

#### 5.2 Унифицировать типы
- Использовать `types/catalog.ts` везде
- Удалить дублирующиеся типы в `types/supabase.ts`

#### 5.3 Оптимизировать запросы
- Добавить индексы в БД для часто используемых полей
- Настроить кэширование для статических данных

### Этап 6: Финальная сборка

#### 6.1 Проверить сборку
```bash
pnpm build
```

#### 6.2 Если сборка падает
- Убрать `export const runtime = "nodejs"` из роутов, которые не используют Node API
- Проверить, что все импорты корректны
- Убедиться, что нет серверного кода в клиентских компонентах

## 🎯 КРИТЕРИИ ГОТОВНОСТИ

### Минимально работающий функционал
- [ ] Dev сервер запускается без ошибок
- [ ] Страница каталога загружается
- [ ] API эндпоинты отвечают корректно
- [ ] TypeScript компилируется без ошибок

### Полный функционал
- [ ] Фильтры и сортировка работают
- [ ] Пагинация работает
- [ ] Загрузка изображений в R2 работает
- [ ] Оптимизация изображений работает
- [ ] Страницы товаров открываются
- [ ] Сборка проходит успешно

### Качество кода
- [ ] Нет неиспользуемых файлов
- [ ] ESLint warnings исправлены
- [ ] Единые типы используются везде
- [ ] Документация актуальна

## 🚨 ВОЗМОЖНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема: "Missing R2 environment variables"
**Решение**: Добавить все R2 переменные в .env.local

### Проблема: "Database error" в каталоге
**Решение**: 
1. Проверить схему БД соответствует supabase_architecture.md
2. Применить миграции
3. Проверить RLS политики

### Проблема: "Column does not exist"
**Решение**: Обновить запросы в services/ согласно реальной схеме БД

### Проблема: Сборка падает на image optimization
**Решение**: Убрать `runtime = "nodejs"` из /api/images/optimize если Sharp не нужен

### Проблема: Конфликты типов
**Решение**: Использовать только типы из types/catalog.ts, удалить дубли

## 📝 CHECKLIST ПЕРЕД КОММИТОМ

- [ ] `pnpm typecheck` - зеленый
- [ ] `pnpm lint` - нет критических ошибок  
- [ ] `pnpm build` - успешная сборка
- [ ] Каталог загружается на localhost:3000/catalog
- [ ] API тесты проходят: `node test-catalog-quick.js`
- [ ] Удалены неиспользуемые файлы
- [ ] README.md актуальна

## 🎉 РЕЗУЛЬТАТ

После выполнения плана проект будет иметь:
- ✅ Чистую архитектуру без дублей
- ✅ Работающий каталог с фильтрами
- ✅ Надежную загрузку в R2
- ✅ Оптимизацию изображений
- ✅ Типобезопасность
- ✅ Готовность к production

**Время выполнения**: 2-4 часа (в зависимости от настройки R2 и Supabase)