// Тестовый файл для проверки API каталога
// Запуск: node test-catalog-api.js

const baseUrl = 'http://localhost:3000';

async function testCatalogAPI() {
  console.log('🧪 Тестирование API каталога...\n');

  try {
    // Тест 1: Получение списка продуктов
    console.log('📋 Тест 1: Получение списка продуктов');
    const response = await fetch(`${baseUrl}/api/catalog/products?limit=3`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ API работает');
      console.log(`📊 Найдено продуктов: ${data.data.products.length}`);

      // Проверяем первый продукт
      if (data.data.products.length > 0) {
        const product = data.data.products[0];
        console.log('\n🔍 Анализ первого продукта:');
        console.log(`├─ ID: ${product.id}`);
        console.log(`├─ Название: ${product.name}`);
        console.log(`├─ Slug: ${product.slug}`);
        console.log(`├─ Thumbnail: ${product.thumbnail || 'НЕТ'}`);
        console.log(`├─ Images: ${product.images ? product.images.length : 0} шт.`);
        console.log(`├─ Track inventory: ${product.track_inventory}`);
        console.log(`├─ Inventory quantity: ${product.inventory_quantity}`);
        console.log(`├─ Base price: ${product.base_price || 'НЕТ'}`);
        console.log(`├─ Sale price: ${product.sale_price || 'НЕТ'}`);
        console.log(`├─ Final price: ${product.final_price || 'НЕТ'}`);
        console.log(`├─ Is on sale: ${product.is_on_sale}`);
        console.log(`├─ Discount %: ${product.discount_percentage || 0}%`);
        console.log(`├─ Brand: ${product.brand_name || 'НЕТ'}`);
        console.log(`└─ Category: ${product.category_name || 'НЕТ'}`);

        // Проверяем логику наличия
        const isInStock = product.track_inventory
          ? (product.inventory_quantity || 0) > 0
          : true;
        console.log(`\n📦 Статус наличия: ${isInStock ? '✅ В наличии' : '❌ Нет в наличии'}`);

        if (product.track_inventory) {
          console.log(`   └─ Отслеживается по складу: количество ${product.inventory_quantity}`);
        } else {
          console.log(`   └─ Не отслеживается по складу: всегда в наличии`);
        }

        // Проверяем изображения
        console.log('\n🖼️ Анализ изображений:');
        if (product.thumbnail) {
          console.log(`├─ Thumbnail URL: ${product.thumbnail}`);
          console.log(`├─ Валидность URL: ${isValidUrl(product.thumbnail) ? '✅' : '❌'}`);
        } else {
          console.log('├─ ❌ Thumbnail отсутствует');
        }

        if (product.images && product.images.length > 0) {
          console.log(`├─ Дополнительные изображения: ${product.images.length} шт.`);
          product.images.forEach((img, index) => {
            console.log(`│  ├─ [${index + 1}] ${img}`);
            console.log(`│  └─ Валидность: ${isValidUrl(img) ? '✅' : '❌'}`);
          });
        } else {
          console.log('└─ ❌ Дополнительные изображения отсутствуют');
        }
      }

      // Тест 2: Проверка фильтрации по наличию
      console.log('\n📋 Тест 2: Фильтрация только товаров в наличии');
      const inStockResponse = await fetch(`${baseUrl}/api/catalog/products?inStockOnly=true&limit=5`);

      if (inStockResponse.ok) {
        const inStockData = await inStockResponse.json();
        console.log(`✅ Товаров в наличии: ${inStockData.data.products.length}`);

        // Проверяем каждый товар
        inStockData.data.products.forEach((product, index) => {
          const isInStock = product.track_inventory
            ? (product.inventory_quantity || 0) > 0
            : true;
          console.log(`├─ [${index + 1}] ${product.name}: ${isInStock ? '✅' : '❌'} (track: ${product.track_inventory}, qty: ${product.inventory_quantity})`);
        });
      }

      // Тест 3: Поиск товаров
      console.log('\n📋 Тест 3: Поиск товаров');
      const searchResponse = await fetch(`${baseUrl}/api/catalog/products?search=а&limit=3`);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log(`✅ Найдено по поиску "а": ${searchData.data.products.length} товаров`);
        searchData.data.products.forEach((product, index) => {
          console.log(`├─ [${index + 1}] ${product.name}`);
        });
      }

    } else {
      console.log('❌ API вернул ошибку:', data.error);
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('\n💡 Убедитесь что:');
    console.log('├─ Сервер запущен на порту 3000');
    console.log('├─ База данных доступна');
    console.log('└─ В таблице products есть данные');
  }
}

// Функция проверки валидности URL
function isValidUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

// Запуск теста
testCatalogAPI();
