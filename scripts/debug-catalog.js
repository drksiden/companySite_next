// Отладочный скрипт для проверки данных каталога
// Запуск: node debug-catalog.js

const baseUrl = 'http://localhost:3000';

async function debugCatalog() {
  console.log('🔍 Отладка каталога товаров...\n');

  try {
    // Тест 1: Проверка API каталога
    console.log('📋 Тест 1: API каталога');
    const catalogResponse = await fetch(`${baseUrl}/api/catalog/products?limit=5`);

    if (!catalogResponse.ok) {
      throw new Error(`Catalog API error: ${catalogResponse.status}`);
    }

    const catalogData = await catalogResponse.json();

    if (!catalogData.success) {
      console.log('❌ API вернул ошибку:', catalogData.error);
      return;
    }

    console.log(`✅ Найдено товаров: ${catalogData.data.products.length}`);

    // Анализ каждого товара
    catalogData.data.products.forEach((product, index) => {
      console.log(`\n📦 Товар ${index + 1}: ${product.name}`);
      console.log(`├─ ID: ${product.id}`);
      console.log(`├─ Slug: ${product.slug}`);
      console.log(`├─ Track inventory: ${product.track_inventory}`);
      console.log(`├─ Inventory quantity: ${product.inventory_quantity}`);
      console.log(`├─ Thumbnail: ${product.thumbnail || 'НЕТ'}`);
      console.log(`├─ Images count: ${product.images ? product.images.length : 0}`);

      // Проверка наличия
      const isInStock = product.track_inventory
        ? (product.inventory_quantity || 0) > 0
        : true;
      console.log(`├─ В наличии: ${isInStock ? '✅' : '❌'}`);

      // Проверка изображений
      if (product.thumbnail) {
        console.log(`├─ Thumbnail валиден: ${isValidUrl(product.thumbnail) ? '✅' : '❌'}`);
      }

      if (product.images && product.images.length > 0) {
        console.log(`└─ Images: ${product.images.map(img => isValidUrl(img) ? '✅' : '❌').join(', ')}`);
      } else {
        console.log(`└─ Images: НЕТ`);
      }
    });

    // Тест 2: Проверка конкретного товара
    const firstProduct = catalogData.data.products[0];
    if (firstProduct) {
      console.log(`\n📋 Тест 2: Страница товара "${firstProduct.slug}"`);

      const productResponse = await fetch(`${baseUrl}/api/products/${firstProduct.slug}`);

      if (productResponse.ok) {
        const productData = await productResponse.json();

        if (productData.success) {
          console.log('✅ Страница товара работает');
          console.log(`├─ Название: ${productData.data.product.name}`);
          console.log(`├─ Изображения: ${productData.data.product.images ? productData.data.product.images.length : 0}`);
          console.log(`├─ Связанные товары: ${productData.data.relatedProducts ? productData.data.relatedProducts.length : 0}`);
          console.log(`└─ Track inventory: ${productData.data.product.track_inventory}`);
        } else {
          console.log('❌ Ошибка получения товара:', productData.error);
        }
      } else {
        console.log(`❌ HTTP ошибка: ${productResponse.status}`);
      }
    }

    // Тест 3: Проверка изображений
    console.log('\n📋 Тест 3: Проверка доступности изображений');

    for (const product of catalogData.data.products.slice(0, 3)) {
      if (product.thumbnail) {
        console.log(`\n🖼️ Проверка изображения: ${product.name}`);
        console.log(`├─ URL: ${product.thumbnail}`);

        try {
          const imgResponse = await fetch(product.thumbnail, { method: 'HEAD' });
          console.log(`└─ Доступность: ${imgResponse.ok ? '✅' : '❌'} (${imgResponse.status})`);
        } catch (error) {
          console.log(`└─ Ошибка загрузки: ❌ (${error.message})`);
        }
      }
    }

    // Тест 4: Проверка товаров без отслеживания склада
    console.log('\n📋 Тест 4: Товары без отслеживания склада');

    const noTrackResponse = await fetch(`${baseUrl}/api/catalog/products?limit=10`);
    const noTrackData = await noTrackResponse.json();

    if (noTrackData.success) {
      const noTrackProducts = noTrackData.data.products.filter(p => !p.track_inventory);
      console.log(`├─ Товаров без отслеживания: ${noTrackProducts.length}`);

      noTrackProducts.forEach(product => {
        const shouldBeInStock = !product.track_inventory;
        console.log(`├─ ${product.name}: ${shouldBeInStock ? '✅ Должен быть в наличии' : '❌ Ошибка логики'}`);
      });
    }

  } catch (error) {
    console.error('❌ Ошибка отладки:', error.message);
    console.log('\n💡 Убедитесь что:');
    console.log('├─ Сервер запущен (pnpm dev)');
    console.log('├─ База данных доступна');
    console.log('└─ В таблице products есть данные');
  }
}

// Проверка валидности URL
function isValidUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
  }
}

// Запуск отладки
debugCatalog();
