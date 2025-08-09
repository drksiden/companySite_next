# Cloudflare R2 File Storage Structure

Эта документация описывает организацию файлов в Cloudflare R2 bucket и утилиты для работы с ними.

## Структура папок

Все файлы организованы в логические папки для удобства управления и масштабирования:

### Изображения (`images/`)
- `images/products/` - Изображения товаров (основные и дополнительные)
- `images/categories/` - Изображения категорий
- `images/brands/` - Логотипы и изображения брендов
- `images/collections/` - Изображения коллекций
- `images/users/` - Изображения пользователей
- `images/avatars/` - Аватары пользователей

### Документы (`documents/`)
- `documents/products/` - Документация к товарам (инструкции, сертификаты)
- `documents/categories/` - Документы категорий
- `documents/legal/` - Правовые документы (договоры, лицензии)
- `documents/manuals/` - Руководства пользователя

### Спецификации (`specifications/`)
- `specifications/products/` - Технические спецификации товаров
- `specifications/technical/` - Общие технические документы

### Временные файлы (`temp/`)
- Временные файлы для обработки и миграции

## Утилиты

### `uploadFileToR2(file, folder)`
Загружает файл в указанную папку R2.

```typescript
import { uploadFileToR2 } from '@/utils/r2/client';

const url = await uploadFileToR2(file, 'images/products');
```

### `deleteFileFromR2(fileUrl)`
Удаляет файл по публичному URL.

```typescript
import { deleteFileFromR2 } from '@/utils/r2/client';

await deleteFileFromR2('https://example.com/images/products/file.jpg');
```

### `deleteMultipleFilesFromR2(fileUrls)`
Удаляет массив файлов одновременно.

```typescript
import { deleteMultipleFilesFromR2 } from '@/utils/r2/client';

await deleteMultipleFilesFromR2([
  'https://example.com/images/products/file1.jpg',
  'https://example.com/images/products/file2.jpg'
]);
```

### `extractR2KeyFromUrl(fileUrl)`
Извлекает ключ объекта из публичного URL.

```typescript
import { extractR2KeyFromUrl } from '@/utils/r2/client';

const key = extractR2KeyFromUrl('https://example.com/images/products/file.jpg');
// Результат: 'images/products/file.jpg'
```

### `isValidR2Url(fileUrl)`
Проверяет, принадлежит ли URL нашему R2 bucket.

```typescript
import { isValidR2Url } from '@/utils/r2/client';

const isValid = isValidR2Url('https://example.com/images/products/file.jpg');
```

## Именование файлов

Все файлы автоматически переименовываются по схеме:
```
{timestamp}_{randomString}_{sanitizedOriginalName}
```

Пример:
```
1703123456789_a1b2c3d4e5f6_product_image.jpg
```

Это обеспечивает:
- Уникальность имен файлов
- Отсутствие конфликтов при загрузке
- Возможность восстановления оригинального имени
- Безопасность (удаление специальных символов)

## Конфигурация

Убедитесь, что в `.env.local` настроены следующие переменные:

```env
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
CLOUDFLARE_R2_CUSTOM_DOMAIN=https://your-custom-domain.com # (опционально)
```

## Использование в API маршрутах

### Создание продукта
```typescript
// В API маршруте
import { uploadFileToR2 } from '@/utils/r2/client';

const imageFiles = formData.getAll('imageFiles') as File[];
const imageUrls: string[] = [];

for (const file of imageFiles) {
  if (file.size > 0) {
    const url = await uploadFileToR2(file, 'images/products');
    imageUrls.push(url);
  }
}
```

### Удаление продукта
```typescript
// В API маршруте
import { deleteMultipleFilesFromR2 } from '@/utils/r2/client';

const filesToDelete = [
  ...product.images,
  ...product.documents.map(doc => doc.url)
];

await deleteMultipleFilesFromR2(filesToDelete);
```

## Миграция существующих файлов

Если у вас есть файлы в старой структуре (например, просто в папке `images/`), можно создать скрипт миграции:

```typescript
// Пример скрипта миграции
import { r2Client, extractR2KeyFromUrl, uploadBufferToR2 } from '@/utils/r2/client';

async function migrateProductImages() {
  // Получить все продукты с изображениями
  const products = await getProductsWithImages();
  
  for (const product of products) {
    const newImageUrls = [];
    
    for (const oldUrl of product.images) {
      const oldKey = extractR2KeyFromUrl(oldUrl);
      if (oldKey && oldKey.startsWith('images/') && !oldKey.startsWith('images/products/')) {
        // Загрузить файл в новую структуру
        const fileBuffer = await downloadFile(oldUrl);
        const newUrl = await uploadBufferToR2(
          fileBuffer, 
          'image/jpeg',
          'images/products',
          `migrated_${Date.now()}.jpg`
        );
        newImageUrls.push(newUrl);
        
        // Удалить старый файл
        await deleteFileFromR2(oldUrl);
      } else {
        newImageUrls.push(oldUrl);
      }
    }
    
    // Обновить продукт с новыми URL
    await updateProduct(product.id, { images: newImageUrls });
  }
}
```

## Мониторинг и логирование

Все операции с файлами логируются в консоль:
- Успешные загрузки
- Успешные удаления
- Ошибки при работе с файлами
- Предупреждения о невалидных URL

Для production окружения рекомендуется настроить более продвинутое логирование.