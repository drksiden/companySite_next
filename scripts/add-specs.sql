-- SQL скрипт для добавления характеристик к товару Test1
-- Выполните этот скрипт в Supabase SQL Editor или через psql

-- Обновляем товар Test1 с характеристиками
UPDATE products
SET
  specifications = '{
    "Бренд": "ТЕКО",
    "Модель": "Test1",
    "Артикул": "ttestt1",
    "Страна производства": "Китай",
    "Гарантия": "12 месяцев",
    "Материал корпуса": "Пластик, металл",
    "Цвет": "Черный",
    "Комплектация": "Устройство, зарядное устройство, документация",
    "Тип подключения": "USB-C",
    "Совместимость": "Windows, macOS, Linux",
    "Рабочая температура": "-10°C до +50°C",
    "Влагозащита": "IP54",
    "Сертификация": "CE, FCC, RoHS"
  }'::jsonb,
  weight = 0.5,
  dimensions = '{
    "length": 20,
    "width": 15,
    "height": 5
  }'::jsonb,
  description = 'Качественное устройство Test1 от бренда ТЕКО. Надежное и функциональное решение для повседневного использования.',
  technical_description = 'Технические характеристики: современные компоненты, энергоэффективность, долговечность. Устройство прошло все необходимые тесты качества и соответствует международным стандартам.',
  updated_at = NOW()
WHERE slug = 'test1';

-- Проверяем результат обновления
SELECT
  id,
  name,
  slug,
  specifications,
  weight,
  dimensions,
  description,
  technical_description
FROM products
WHERE slug = 'test1';

-- Дополнительно: если нужно создать еще один тестовый товар с характеристиками
/*
INSERT INTO products (
  id,
  name,
  slug,
  sku,
  short_description,
  description,
  technical_description,
  category_id,
  brand_id,
  base_price,
  currency_id,
  track_inventory,
  inventory_quantity,
  min_stock_level,
  allow_backorder,
  weight,
  dimensions,
  images,
  specifications,
  status,
  is_featured,
  is_digital,
  sort_order,
  view_count,
  sales_count,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'iPhone 15 Pro',
  'iphone-15-pro',
  'APL-IP15P-256',
  'Профессиональный смартфон Apple с титановым корпусом',
  'iPhone 15 Pro представляет собой вершину инженерной мысли Apple. Титановый корпус обеспечивает прочность и легкость, а чип A17 Pro открывает новые возможности для мобильной фотографии и игр.',
  'Смартфон построен на базе 3-нанометрового процессора A17 Pro с 6-ядерным CPU и 6-ядерным GPU. Поддерживает стандарты связи 5G, Wi-Fi 6E, Bluetooth 5.3. Система камер Pro включает основной модуль 48 Мп с переменным фокусным расстоянием.',
  (SELECT id FROM categories WHERE slug = 'smartphones' LIMIT 1),
  (SELECT id FROM brands WHERE slug = 'apple' LIMIT 1),
  650000,
  (SELECT id FROM currencies WHERE code = 'KZT' LIMIT 1),
  true,
  15,
  5,
  false,
  0.187,
  '{"length": 14.76, "width": 7.15, "height": 0.83}'::jsonb,
  '["https://example.com/iphone15pro.jpg"]'::jsonb,
  '{
    "Операционная система": "iOS 17",
    "Процессор": "Apple A17 Pro",
    "Диагональ экрана": "6.1 дюйма",
    "Разрешение экрана": "2556×1179 пикселей",
    "Оперативная память": "8 ГБ",
    "Встроенная память": "256 ГБ",
    "Основная камера": "48 Мп",
    "Фронтальная камера": "12 Мп",
    "Емкость аккумулятора": "3349 мАч",
    "Беспроводная зарядка": "Да",
    "Защита": "IP68",
    "Материал корпуса": "Титан",
    "Цвет": "Натуральный титан",
    "SIM-карты": "nano-SIM + eSIM",
    "5G": "Да",
    "NFC": "Да",
    "Bluetooth": "5.3",
    "Wi-Fi": "802.11ax (Wi-Fi 6E)",
    "Разъем зарядки": "USB-C"
  }'::jsonb,
  'active',
  true,
  false,
  1,
  0,
  0,
  NOW(),
  NOW()
);
*/
