// Скрипт для добавления тестовых характеристик к товару
// Запуск: node add-product-specs.js

const baseUrl = 'http://localhost:3000';

async function addProductSpecs() {
  console.log('📦 Добавление характеристик к товару...\n');

  try {
    // Сначала получим список товаров
    console.log('1. Получение списка товаров...');
    const productsResponse = await fetch(`${baseUrl}/api/catalog/products?limit=10`);

    if (!productsResponse.ok) {
      throw new Error(`Products API error: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();

    if (!productsData.success || !productsData.data.products.length) {
      console.log('❌ Товары не найдены');
      return;
    }

    const product = productsData.data.products[0];
    console.log(`✅ Найден товар: ${product.name} (ID: ${product.id})`);

    // Создаем тестовые характеристики в зависимости от названия товара
    let specifications = {};
    let dimensions = null;
    let weight = null;

    const productName = product.name.toLowerCase();

    if (productName.includes('iphone') || productName.includes('телефон') || productName.includes('смартфон')) {
      // Характеристики для смартфона
      specifications = {
        'Операционная система': 'iOS 17',
        'Процессор': 'Apple A17 Pro',
        'Диагональ экрана': '6.1 дюйма',
        'Разрешение экрана': '2556×1179 пикселей',
        'Оперативная память': '8 ГБ',
        'Встроенная память': '256 ГБ',
        'Основная камера': '48 Мп',
        'Фронтальная камера': '12 Мп',
        'Емкость аккумулятора': '3349 мАч',
        'Беспроводная зарядка': 'Да',
        'Защита': 'IP68',
        'Материал корпуса': 'Титан',
        'Цвет': 'Натуральный титан',
        'SIM-карты': 'nano-SIM + eSIM',
        '5G': 'Да',
        'NFC': 'Да',
        'Bluetooth': '5.3',
        'Wi-Fi': '802.11ax (Wi-Fi 6E)',
        'Разъем для наушников': 'Нет',
        'Разъем зарядки': 'USB-C'
      };
      dimensions = {
        length: 14.76,
        width: 7.15,
        height: 0.83
      };
      weight = 0.187;
    } else if (productName.includes('macbook') || productName.includes('ноутбук') || productName.includes('laptop')) {
      // Характеристики для ноутбука
      specifications = {
        'Операционная система': 'macOS Sonoma',
        'Процессор': 'Apple M3',
        'Количество ядер': '8 ядер (4 производительных + 4 энергоэффективных)',
        'Графический процессор': '10-ядерный GPU',
        'Neural Engine': '16-ядерный',
        'Диагональ экрана': '13.6 дюйма',
        'Разрешение экрана': '2560×1664 пикселей',
        'Тип экрана': 'Liquid Retina',
        'Яркость': '500 нит',
        'Широкая цветовая гамма': 'P3',
        'Оперативная память': '8 ГБ',
        'Встроенная память': '256 ГБ SSD',
        'Клавиатура': 'Magic Keyboard с подсветкой',
        'Трекпад': 'Force Touch',
        'Камера': '1080p FaceTime HD',
        'Микрофоны': '3 микрофона',
        'Динамики': '4 динамика с поддержкой Spatial Audio',
        'Порты': '2×Thunderbolt/USB 4, разъем для наушников 3.5мм, MagSafe 3',
        'Wi-Fi': '802.11ax (Wi-Fi 6E)',
        'Bluetooth': '5.3',
        'Время работы': 'До 18 часов',
        'Материал корпуса': 'Алюминий',
        'Цвет': 'Серый космос'
      };
      dimensions = {
        length: 30.41,
        width: 21.5,
        height: 1.13
      };
      weight = 1.24;
    } else if (productName.includes('ipad') || productName.includes('планшет') || productName.includes('tablet')) {
      // Характеристики для планшета
      specifications = {
        'Операционная система': 'iPadOS 17',
        'Процессор': 'Apple M2',
        'Диагональ экрана': '12.9 дюйма',
        'Разрешение экрана': '2732×2048 пикселей',
        'Тип экрана': 'Liquid Retina XDR',
        'Яркость': '1000 нит (обычная), 1600 нит (пиковая)',
        'Оперативная память': '8 ГБ',
        'Встроенная память': '256 ГБ',
        'Основная камера': '12 Мп + 10 Мп (ультраширокоугольная)',
        'Фронтальная камера': '12 Мп TrueDepth',
        'Видеозапись': '4K',
        'LiDAR': 'Да',
        'Apple Pencil': '2-го поколения',
        'Smart Keyboard': 'Поддерживается',
        'Face ID': 'Да',
        'Порты': 'Thunderbolt/USB 4',
        'Wi-Fi': '802.11ax (Wi-Fi 6E)',
        'Bluetooth': '5.3',
        'Время работы': 'До 10 часов',
        'Материал корпуса': 'Алюминий',
        'Цвет': 'Серый космос'
      };
      dimensions = {
        length: 28.06,
        width: 21.49,
        height: 0.64
      };
      weight = 0.682;
    } else {
      // Общие характеристики для любого товара
      specifications = {
        'Бренд': product.brand_name || 'Не указан',
        'Модель': product.name,
        'Артикул': product.sku || 'Не указан',
        'Страна производства': 'Китай',
        'Гарантия': '12 месяцев',
        'Комплектация': 'Устройство, зарядное устройство, документация',
        'Материал': 'Пластик, металл',
        'Цвет': 'Черный'
      };
      dimensions = {
        length: 20,
        width: 15,
        height: 5
      };
      weight = 0.5;
    }

    console.log('\n📋 Характеристики для добавления:');
    Object.entries(specifications).forEach(([key, value]) => {
      console.log(`├─ ${key}: ${value}`);
    });

    if (dimensions) {
      console.log(`├─ Размеры: ${dimensions.length}×${dimensions.width}×${dimensions.height} см`);
    }
    if (weight) {
      console.log(`└─ Вес: ${weight} кг`);
    }

    // Обновляем товар через API
    console.log('\n2. Обновление товара...');

    const updateData = {
      specifications: JSON.stringify(specifications),
      weight: weight,
      dimensions: JSON.stringify(dimensions)
    };

    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const updateResponse = await fetch(`${baseUrl}/api/admin/products/${product.id}`, {
      method: 'PUT',
      body: formData
    });

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Товар успешно обновлен!');

      // Проверяем результат
      console.log('\n3. Проверка обновления...');
      const checkResponse = await fetch(`${baseUrl}/api/products/${product.slug}`);

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        const updatedProduct = checkData.data.product;

        console.log('📊 Результат обновления:');
        console.log(`├─ Характеристик: ${Object.keys(updatedProduct.specifications || {}).length}`);
        console.log(`├─ Вес: ${updatedProduct.weight || 'Не указан'} кг`);
        console.log(`└─ Размеры: ${updatedProduct.dimensions ?
          `${updatedProduct.dimensions.length}×${updatedProduct.dimensions.width}×${updatedProduct.dimensions.height} см` :
          'Не указаны'}`);

        console.log(`\n🎉 Готово! Откройте страницу товара: ${baseUrl}/product/${product.slug}`);
      }
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Ошибка обновления:', errorText);
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.log('\n💡 Убедитесь что:');
    console.log('├─ Сервер запущен (pnpm dev)');
    console.log('├─ База данных доступна');
    console.log('└─ В каталоге есть товары');
  }
}

// Запуск скрипта
addProductSpecs();
