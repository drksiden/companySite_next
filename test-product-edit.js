// Тестовый скрипт для проверки API редактирования товара
// Запуск: node test-product-edit.js

const baseUrl = 'http://localhost:3000';

async function testProductEdit() {
  console.log('🧪 Тестирование API редактирования товара...\n');

  try {
    // Шаг 1: Получаем список товаров
    console.log('1. Получение списка товаров для админки...');
    const productsResponse = await fetch(`${baseUrl}/api/admin/products?limit=5`);

    if (!productsResponse.ok) {
      throw new Error(`Products API error: ${productsResponse.status}`);
    }

    const productsData = await productsResponse.json();

    if (!productsData.products || !productsData.products.length) {
      console.log('❌ Товары не найдены');
      return;
    }

    const product = productsData.products[0];
    console.log(`✅ Найден товар: ${product.name} (ID: ${product.id})`);

    // Анализируем структуру данных
    console.log('\n📊 Структура данных товара:');
    console.log(`├─ ID: ${product.id}`);
    console.log(`├─ Название: ${product.name}`);
    console.log(`├─ Category ID: ${product.category_id}`);
    console.log(`├─ Brand ID: ${product.brand_id}`);
    console.log(`├─ Collection ID: ${product.collection_id}`);

    // Проверяем связанные объекты
    if (product.categories) {
      console.log(`├─ Связанная категория: ${JSON.stringify(product.categories)}`);
    }
    if (product.brands) {
      console.log(`├─ Связанный бренд: ${JSON.stringify(product.brands)}`);
    }
    if (product.collections) {
      console.log(`├─ Связанная коллекция: ${JSON.stringify(product.collections)}`);
    }

    // Шаг 2: Получаем данные для форм (categories, brands, etc.)
    console.log('\n2. Получение данных для форм...');
    const formDataResponse = await fetch(`${baseUrl}/api/admin/form-data?type=all`);

    if (!formDataResponse.ok) {
      throw new Error(`Form data API error: ${formDataResponse.status}`);
    }

    const formData = await formDataResponse.json();
    console.log(`✅ Категории: ${formData.categories?.length || 0}`);
    console.log(`✅ Бренды: ${formData.brands?.length || 0}`);
    console.log(`✅ Коллекции: ${formData.collections?.length || 0}`);
    console.log(`✅ Валюты: ${formData.currencies?.length || 0}`);

    // Шаг 3: Подготавливаем данные для обновления
    console.log('\n3. Подготовка данных для обновления...');

    const updateFormData = new FormData();
    updateFormData.append('id', product.id);
    updateFormData.append('name', product.name + ' (ОБНОВЛЕНО)');
    updateFormData.append('slug', product.slug);
    updateFormData.append('short_description', product.short_description || 'Тестовое описание');
    updateFormData.append('description', product.description || 'Обновленное описание товара');
    updateFormData.append('base_price', String(product.base_price || 100));
    updateFormData.append('category_id', product.category_id || '');
    updateFormData.append('brand_id', product.brand_id || 'null');
    updateFormData.append('collection_id', product.collection_id || 'null');
    updateFormData.append('inventory_quantity', String(product.inventory_quantity || 0));
    updateFormData.append('track_inventory', String(product.track_inventory || false));
    updateFormData.append('min_stock_level', String(product.min_stock_level || 0));
    updateFormData.append('allow_backorder', String(product.allow_backorder || false));
    updateFormData.append('is_featured', String(product.is_featured || false));
    updateFormData.append('is_digital', String(product.is_digital || false));
    updateFormData.append('status', product.status || 'active');
    updateFormData.append('sort_order', String(product.sort_order || 0));

    // Изображения
    updateFormData.append('existingImages', JSON.stringify(product.images || []));

    // Документы
    updateFormData.append('existingDocuments', JSON.stringify(product.documents || []));

    // Характеристики
    const specs = product.specifications || {};
    updateFormData.append('specifications', JSON.stringify(specs));

    // Размеры
    const dimensions = product.dimensions || {};
    updateFormData.append('dimensions', JSON.stringify(dimensions));

    console.log('📋 Данные для обновления подготовлены');

    // Шаг 4: Отправляем запрос на обновление
    console.log('\n4. Отправка запроса на обновление...');

    const updateResponse = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'PUT',
      body: updateFormData
    });

    console.log(`📡 Статус ответа: ${updateResponse.status}`);

    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Товар успешно обновлен!');
      console.log(`├─ Новое название: ${updateResult.name}`);
      console.log(`├─ ID: ${updateResult.id}`);
      console.log(`└─ Статус: ${updateResult.status}`);
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Ошибка обновления:');
      console.log(`├─ Статус: ${updateResponse.status}`);
      console.log(`├─ Заголовки: ${JSON.stringify(Object.fromEntries(updateResponse.headers))}`);
      console.log(`└─ Ответ: ${errorText}`);

      // Попробуем распарсить как JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 JSON ошибка:', errorJson);
      } catch (e) {
        console.log('📋 Ошибка не в JSON формате');
      }
    }

    // Шаг 5: Проверяем результат обновления
    console.log('\n5. Проверка результата...');
    const checkResponse = await fetch(`${baseUrl}/api/admin/products?limit=5`);

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      const updatedProduct = checkData.products.find(p => p.id === product.id);

      if (updatedProduct) {
        console.log('✅ Товар найден после обновления:');
        console.log(`├─ Название: ${updatedProduct.name}`);
        console.log(`├─ Описание: ${updatedProduct.description?.substring(0, 50)}...`);
        console.log(`├─ Category ID: ${updatedProduct.category_id}`);
        console.log(`├─ Brand ID: ${updatedProduct.brand_id}`);
        console.log(`└─ Статус: ${updatedProduct.status}`);
      } else {
        console.log('❌ Товар не найден после обновления');
      }
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    console.log('\n💡 Возможные причины:');
    console.log('├─ Сервер не запущен (pnpm dev)');
    console.log('├─ База данных недоступна');
    console.log('├─ Ошибка в API эндпоинте');
    console.log('├─ Проблемы с CORS');
    console.log('└─ Неправильная структура данных');

    if (error.stack) {
      console.log('\n📋 Stack trace:');
      console.log(error.stack);
    }
  }
}

// Запуск теста
testProductEdit();
