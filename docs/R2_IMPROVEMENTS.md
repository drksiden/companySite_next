# R2 Storage Improvements & Next.js 15 Compatibility Fixes

Этот документ описывает все улучшения, сделанные в системе хранения файлов Cloudflare R2 и исправления совместимости с Next.js 15.

## 🚀 Основные изменения

### 1. Исправление проблемы с удалением товаров
**Проблема**: При удалении товаров в админке передавался "0" вместо реального UUID товара.

**Решение**:
- Добавлен `getRowId: (row) => row.id` в конфигурацию `useReactTable`
- Теперь таблица использует UUID товаров вместо индексов строк

**Файлы**:
- `src/components/admin/ProductManagerClient.tsx`

### 2. Совместимость с Next.js 15
**Проблема**: В Next.js 15 изменились правила работы с динамическими параметрами в API маршрутах.

**Решение**:
- Изменен тип параметров с `{ params: { id: string } }` на `{ params: Promise<{ id: string }> }`
- Добавлен `await` перед обращением к `params`

**Обновленные файлы**:
- `src/app/api/admin/products/[productId]/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/files/[key]/route.ts`
- `src/app/api/products/[slug]/route.ts`

### 3. Улучшенная структура папок в R2

**Старая структура**:
```
images/
├── file1.jpg
├── file2.png
└── ...

documents/
├── doc1.pdf
└── ...
```

**Новая структура**:
```
images/
├── products/
│   ├── 1703123456789_a1b2c3d4e5f6_product_image.jpg
│   └── ...
├── categories/
├── brands/
├── collections/
├── users/
└── avatars/

documents/
├── products/
├── categories/
├── legal/
└── manuals/

specifications/
├── products/
└── technical/

temp/
```

## 🛠 Новая утилита R2

### Местоположение
`src/utils/r2/client.ts`

### Основные функции

#### `uploadFileToR2(file, folder)`
Загружает файл в указанную папку с автоматическим именованием:
```typescript
const url = await uploadFileToR2(file, 'images/products');
```

#### `deleteFileFromR2(fileUrl)` 
Удаляет файл по публичному URL:
```typescript
await deleteFileFromR2('https://cdn.example.com/images/products/file.jpg');
```

#### `deleteMultipleFilesFromR2(fileUrls)`
Удаляет массив файлов одновременно:
```typescript
await deleteMultipleFilesFromR2([url1, url2, url3]);
```

#### `extractR2KeyFromUrl(fileUrl)`
Извлекает ключ объекта из URL:
```typescript
const key = extractR2KeyFromUrl('https://cdn.example.com/images/products/file.jpg');
// Результат: 'images/products/file.jpg'
```

### Типы папок (R2Folder)
```typescript
type R2Folder = 
  | "images/products"
  | "images/categories" 
  | "images/brands"
  | "images/collections"
  | "images/users"
  | "images/avatars"
  | "documents/products"
  | "documents/categories"
  | "documents/legal"
  | "documents/manuals"
  | "specifications/products"
  | "specifications/technical"
  | "temp";
```

## 🔧 Именование файлов

### Схема именования
```
{timestamp}_{randomString}_{sanitizedOriginalName}
```

### Пример
```
1703123456789_a1b2c3d4e5f6_product_image.jpg
```

### Преимущества
- ✅ Уникальность имен файлов
- ✅ Отсутствие конфликтов при загрузке
- ✅ Возможность восстановления оригинального имени
- ✅ Безопасность (удаление специальных символов)

## 📂 Обновленные API маршруты

### Загрузка файлов продуктов
**Изображения**: `images/products/`
```typescript
const imageUrl = await uploadFileToR2(imageFile, 'images/products');
```

**Документы**: `documents/products/`
```typescript
const docUrl = await uploadFileToR2(docFile, 'documents/products');
```

**Спецификации**: `specifications/products/`
```typescript
const specUrl = await uploadFileToR2(specFile, 'specifications/products');
```

### Удаление при удалении продукта
```typescript
const filesToDelete = [
  ...product.images,
  ...product.documents.map(doc => doc.url),
  ...product.specifications.map(spec => spec.url)
];
await deleteMultipleFilesFromR2(filesToDelete);
```

## 🐛 Исправленные проблемы

### 1. Неправильное извлечение ключа из URL
**Было**: Простое удаление слэша
```typescript
const key = url.pathname.substring(1);
```

**Стало**: Корректная обработка базового URL
```typescript
const key = fileUrl.substring(baseUrl.length + 1);
```

### 2. Ошибки типов TypeScript
- Заменены `any` типы на более строгие типы
- Исправлена обработка ошибок с правильными типами
- Добавлена валидация параметров

### 3. Проблемы совместимости Next.js 15
- Все динамические маршруты обновлены для async params
- Исправлены типы параметров в API routes

## 📋 Конфигурация

### Переменные окружения
```env
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://your-custom-domain.com # (опционально)
```

## 🔄 Миграция существующих файлов

Для миграции файлов из старой структуры в новую:

1. Создать скрипт миграции
2. Переместить файлы в соответствующие папки
3. Обновить URL в базе данных
4. Удалить старые файлы

Пример кода в `src/utils/r2/README.md`

## ✅ Результаты

### Исправлено
- ✅ Удаление товаров теперь работает корректно
- ✅ Правильная передача UUID вместо индексов
- ✅ Совместимость с Next.js 15
- ✅ Организованная структура файлов в R2
- ✅ Улучшенная обработка ошибок
- ✅ Безопасное именование файлов

### Улучшено
- 🚀 Более быстрое удаление множественных файлов
- 🔒 Лучшая безопасность файлов
- 📁 Логичная организация структуры
- 🛠 Переиспользуемые утилиты
- 📚 Подробная документация

## 🎯 Следующие шаги

1. **Добавить поддержку для других типов контента**:
   - API для категорий с загрузкой в `images/categories/`
   - API для брендов с загрузкой в `images/brands/`
   - API для коллекций с загрузкой в `images/collections/`

2. **Оптимизация изображений**:
   - Интеграция с Sharp для автоматического сжатия
   - Генерация миниатюр разных размеров
   - WebP конвертация

3. **Мониторинг и логирование**:
   - Детальное логирование операций с файлами
   - Метрики использования storage
   - Alerts при ошибках

4. **Кэширование**:
   - CDN интеграция
   - Оптимизация для быстрой загрузки

Все изменения протестированы и готовы к продакшену! 🎉