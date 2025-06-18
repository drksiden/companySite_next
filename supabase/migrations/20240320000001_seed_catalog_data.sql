-- Insert brands
INSERT INTO brands (name, description) VALUES
    ('ТЕКО', 'Производитель охранных систем и оборудования'),
    ('ANT', 'Производитель сетевого оборудования'),
    ('Flexem', 'Производитель систем видеонаблюдения');

-- Insert categories
INSERT INTO categories (name, description) VALUES
    ('Охранная сигнализация', 'Системы охранной сигнализации и датчики'),
    ('Сетевое оборудование', 'Сетевое оборудование и коммутаторы'),
    ('Видеонаблюдение', 'Системы видеонаблюдения и камеры');

-- Insert subcategories (используем подзапросы для получения ID категорий)
INSERT INTO subcategories (category_id, name, description) 
SELECT id, 'Беспроводные', 'Беспроводные системы охранной сигнализации'
FROM categories WHERE name = 'Охранная сигнализация'
UNION ALL
SELECT id, 'Проводные', 'Проводные системы охранной сигнализации'
FROM categories WHERE name = 'Охранная сигнализация'
UNION ALL
SELECT id, 'Умный дом', 'Системы умного дома и автоматизации'
FROM categories WHERE name = 'Охранная сигнализация'
UNION ALL
SELECT id, 'Извещатели', 'Охранные извещатели и датчики'
FROM categories WHERE name = 'Охранная сигнализация'
UNION ALL
SELECT id, 'Коммутаторы', 'Сетевые коммутаторы'
FROM categories WHERE name = 'Сетевое оборудование'
UNION ALL
SELECT id, 'Маршрутизаторы', 'Сетевые маршрутизаторы'
FROM categories WHERE name = 'Сетевое оборудование'
UNION ALL
SELECT id, 'IP-камеры', 'IP-камеры видеонаблюдения'
FROM categories WHERE name = 'Видеонаблюдение'
UNION ALL
SELECT id, 'Аналоговые камеры', 'Аналоговые камеры видеонаблюдения'
FROM categories WHERE name = 'Видеонаблюдение';

-- Insert collections (используем подзапросы для получения ID)
INSERT INTO collections (subcategory_id, brand_id, name, description)
SELECT 
    (SELECT id FROM subcategories WHERE name = 'Беспроводные' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    'Астра Прайм',
    'Беспроводная система охранной сигнализации'
UNION ALL
SELECT 
    (SELECT id FROM subcategories WHERE name = 'Беспроводные' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    'Астра РИ-М',
    'Беспроводная система с GSM-модулем'
UNION ALL
SELECT 
    (SELECT id FROM subcategories WHERE name = 'Проводные' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    'Астра-321',
    'Проводная система охранной сигнализации'
UNION ALL
SELECT 
    (SELECT id FROM subcategories WHERE name = 'Извещатели' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    'ИП-212',
    'Серия охранных извещателей'
UNION ALL
SELECT 
    (SELECT id FROM subcategories WHERE name = 'Коммутаторы' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'ANT' LIMIT 1),
    'ANT-2000',
    'Серия сетевых коммутаторов'
UNION ALL
SELECT 
    (SELECT id FROM subcategories WHERE name = 'IP-камеры' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Flexem' LIMIT 1),
    'FlexCam Pro',
    'Серия IP-камер видеонаблюдения';

-- Insert products (используем подзапросы для получения ID)
INSERT INTO products (title, description, price, brand_id, collection_id, subcategory_id)
SELECT 
    'Астра Прайм Базовый',
    'Базовый комплект беспроводной сигнализации',
    15000.00,
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'Астра Прайм' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Беспроводные' LIMIT 1)
UNION ALL
SELECT 
    'Астра Прайм Расширенный',
    'Расширенный комплект с дополнительными датчиками',
    25000.00,
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'Астра Прайм' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Беспроводные' LIMIT 1)
UNION ALL
SELECT 
    'Астра РИ-М Стандарт',
    'Беспроводная система с GSM-модулем',
    20000.00,
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'Астра РИ-М' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Беспроводные' LIMIT 1)
UNION ALL
SELECT 
    'Астра-321 Базовый',
    'Базовый комплект проводной сигнализации',
    12000.00,
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'Астра-321' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Проводные' LIMIT 1)
UNION ALL
SELECT 
    'ИП-212-45',
    'Охранный извещатель',
    1500.00,
    (SELECT id FROM brands WHERE name = 'ТЕКО' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'ИП-212' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Извещатели' LIMIT 1)
UNION ALL
SELECT 
    'ANT-2000-24',
    '24-портовый коммутатор',
    8000.00,
    (SELECT id FROM brands WHERE name = 'ANT' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'ANT-2000' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'Коммутаторы' LIMIT 1)
UNION ALL
SELECT 
    'FlexCam Pro 4K',
    'IP-камера 4K разрешения',
    12000.00,
    (SELECT id FROM brands WHERE name = 'Flexem' LIMIT 1),
    (SELECT id FROM collections WHERE name = 'FlexCam Pro' LIMIT 1),
    (SELECT id FROM subcategories WHERE name = 'IP-камеры' LIMIT 1);

-- Insert product variants (используем подзапросы для получения ID)
INSERT INTO product_variants (product_id, title, price, sku)
SELECT 
    (SELECT id FROM products WHERE title = 'Астра Прайм Базовый' LIMIT 1),
    'Астра Прайм Базовый (белый)',
    15000.00,
    'AP-BASE-W'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'Астра Прайм Базовый' LIMIT 1),
    'Астра Прайм Базовый (черный)',
    15000.00,
    'AP-BASE-B'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'Астра Прайм Расширенный' LIMIT 1),
    'Астра Прайм Расширенный (белый)',
    25000.00,
    'AP-EXT-W'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'Астра Прайм Расширенный' LIMIT 1),
    'Астра Прайм Расширенный (черный)',
    25000.00,
    'AP-EXT-B'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'ИП-212-45' LIMIT 1),
    'ИП-212-45 (белый)',
    1500.00,
    'IP212-45-W'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'ИП-212-45' LIMIT 1),
    'ИП-212-45 (черный)',
    1500.00,
    'IP212-45-B'
UNION ALL
SELECT 
    (SELECT id FROM products WHERE title = 'ИП-212-45' LIMIT 1),
    'ИП-212-45 (с защитой от пыли)',
    2000.00,
    'IP212-45-D'; 