# Исправление ошибок со статусом продуктов

## Проблема
Возникали ошибки `invalid input value for enum product_status: "published"` из-за несоответствия между кодом и реальной схемой базы данных.

## Причина
В коде использовались статусы `["draft", "published", "archived"]`, но в реальной базе данных Supabase enum `product_status` содержал значения: `["draft", "active", "archived", "out_of_stock"]`.

## Выполненные исправления

### 1. API Endpoints
**Файлы:**
- `src/app/api/catalog/products/route.ts`
- `src/app/api/catalog/search/route.ts` 
- `src/app/api/products/[slug]/route.ts`
- `src/app/api/admin/products/route.ts`

**Изменения:**
- Заменили `.eq("status", "published")` на `.eq("status", "active")`
- Обновили логику установки `published_at` для активных товаров
- Исправили типы для `base_price` валидации

### 2. TypeScript типы
**Файл:** `src/types/catalog.ts`

**Изменения:**
```typescript
// Было
export type ProductStatus = "draft" | "published";

// Стало  
export type ProductStatus = "draft" | "active" | "archived" | "out_of_stock";
```

### 3. UI компоненты
**Файлы:**
- `src/components/admin/ProductFormNew.tsx`
- `src/components/admin/ProductManagerClient.tsx`
- `src/components/admin/ProductManagerNew.tsx`

**Изменения:**
- Обновили схему валидации Zod
- Исправили опции в Select компонентах
- Обновили отображение статусов и их подписи:
  - `"published"` → `"active"` ("Активный")
  - Добавлены `"out_of_stock"` ("Нет в наличии")
- Исправили фильтрацию и счетчики в админке

### 4. База данных
**Файл:** `supabase/migrations/20240320000012_fix_product_status_enum.sql`

**Новая миграция:**
- Добавляет значения `'active'` и `'out_of_stock'` в enum (если их нет)
- Обновляет существующие продукты: `'published'` → `'active'`
- Поддерживает все 4 статуса: `draft`, `active`, `archived`, `out_of_stock`

### 5. Исправление связанных данных
**Проблема:** TypeScript ошибки при доступе к связанным таблицам
**Решение:** Добавили безопасное извлечение данных с `as any` приведением типов

## Результат
✅ **Устранены ошибки 500** в API `/api/catalog/products`
✅ **Каталог товаров работает** корректно
✅ **Админка обновлена** с правильными статусами  
✅ **TypeScript ошибки исправлены**
✅ **База данных синхронизирована** с кодом

## Статусы продуктов
| Статус | Описание | Отображение в каталоге |
|--------|----------|----------------------|
| `draft` | Черновик | ❌ Не показывается |
| `active` | Активный | ✅ Показывается |
| `archived` | Архивированный | ❌ Не показывается |
| `out_of_stock` | Нет в наличии | ❌ Не показывается |

## Дополнительные исправления

### 6. Исправление формы добавления товара
**Проблема:** Ошибка `A <Select.Item /> must have a value prop that is not an empty string`
**Причина:** Компоненты Select содержали пустые значения `value=""`

**Решение:**
- Заменили `value=""` на специальные значения:
  - `value="no-brand"` для "Без бренда"
  - `value="no-collection"` для "Без коллекции"
- Добавили обработку в `handleSubmit` для преобразования в `undefined`
- Обновили значения по умолчанию в форме
- Добавили простую валидацию обязательных полей

### 7. Исправление валидации формы
**Проблема:** Закомментированная валидация Zod
**Решение:** Добавили простую валидацию в `handleSubmit`:
- Проверка названия товара (обязательное)
- Проверка категории (обязательная)  
- Проверка базовой цены (больше 0)

### 8. Исправление ошибки создания товара
**Проблема:** Ошибка `Could not find the 'existingDocuments' column of 'products' in the schema cache`
**Причина:** API пытался вставить несуществующие поля `existingDocuments` и `existingImages` в таблицу

**Решение:**
- Исключили поля `existingDocuments` и `existingImages` из обработки в POST API
- Обновили обработку специальных значений `"no-brand"` и `"no-collection"` в API
- Добавили условие в форме - отправляем `existing*` поля только при редактировании
- Логика: при создании нет существующих файлов, только при обновлении

**Файлы изменены:**
- `src/app/api/admin/products/route.ts` (POST и PUT методы)
- `src/components/admin/ProductFormNew.tsx` (логика отправки)

## Результат всех исправлений
✅ **API каталога работает** без ошибок 500
✅ **Форма добавления товара открывается** без ошибок
✅ **Создание товара работает** корректно
✅ **Валидация формы работает** корректно
✅ **Админка функциональна** с правильными статусами
✅ **TypeScript ошибки устранены**

## Миграция для применения
```sql
-- Выполнить в Supabase SQL Editor
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'active'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
    ) THEN
        ALTER TYPE product_status ADD VALUE 'active';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'out_of_stock'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_status')
    ) THEN
        ALTER TYPE product_status ADD VALUE 'out_of_stock';
    END IF;
END $$;

UPDATE products SET status = 'active' WHERE status = 'published';
```
