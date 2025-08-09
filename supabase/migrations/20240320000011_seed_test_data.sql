-- Seed test data for the catalog
-- This migration adds sample data for testing the admin interface

-- Insert sample brands
INSERT INTO brands (name, slug, description, logo_url, website, country, is_active, sort_order) VALUES
('Apple', 'apple', 'Американская технологическая компания', 'https://example.com/logos/apple.png', 'https://apple.com', 'США', true, 1),
('Samsung', 'samsung', 'Южнокорейская электронная компания', 'https://example.com/logos/samsung.png', 'https://samsung.com', 'Южная Корея', true, 2),
('Xiaomi', 'xiaomi', 'Китайская технологическая компания', 'https://example.com/logos/xiaomi.png', 'https://xiaomi.com', 'Китай', true, 3),
('Sony', 'sony', 'Японская многонациональная корпорация', 'https://example.com/logos/sony.png', 'https://sony.com', 'Япония', true, 4),
('LG', 'lg', 'Южнокорейская электронная компания', 'https://example.com/logos/lg.png', 'https://lg.com', 'Южная Корея', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample categories (hierarchical structure)
INSERT INTO categories (name, slug, description, parent_id, level, path, image_url, is_active, sort_order) VALUES
('Электроника', 'electronics', 'Все виды электронных устройств', NULL, 0, 'electronics', 'https://example.com/categories/electronics.jpg', true, 1),
('Бытовая техника', 'appliances', 'Техника для дома', NULL, 0, 'appliances', 'https://example.com/categories/appliances.jpg', true, 2),
('Компьютеры и аксессуары', 'computers', 'Компьютерная техника', NULL, 0, 'computers', 'https://example.com/categories/computers.jpg', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs and insert subcategories
DO $$
DECLARE
    electronics_id uuid;
    appliances_id uuid;
    computers_id uuid;
BEGIN
    SELECT id INTO electronics_id FROM categories WHERE slug = 'electronics';
    SELECT id INTO appliances_id FROM categories WHERE slug = 'appliances';
    SELECT id INTO computers_id FROM categories WHERE slug = 'computers';

    -- Insert subcategories
    INSERT INTO categories (name, slug, description, parent_id, level, path, image_url, is_active, sort_order) VALUES
    ('Смартфоны', 'smartphones', 'Мобильные телефоны', electronics_id, 1, 'electronics/smartphones', 'https://example.com/categories/smartphones.jpg', true, 1),
    ('Планшеты', 'tablets', 'Планшетные компьютеры', electronics_id, 1, 'electronics/tablets', 'https://example.com/categories/tablets.jpg', true, 2),
    ('Наушники', 'headphones', 'Аудио наушники', electronics_id, 1, 'electronics/headphones', 'https://example.com/categories/headphones.jpg', true, 3),
    ('Телевизоры', 'tvs', 'Телевизоры и мониторы', appliances_id, 1, 'appliances/tvs', 'https://example.com/categories/tvs.jpg', true, 1),
    ('Холодильники', 'refrigerators', 'Холодильное оборудование', appliances_id, 1, 'appliances/refrigerators', 'https://example.com/categories/refrigerators.jpg', true, 2),
    ('Ноутбуки', 'laptops', 'Портативные компьютеры', computers_id, 1, 'computers/laptops', 'https://example.com/categories/laptops.jpg', true, 1),
    ('Клавиатуры', 'keyboards', 'Компьютерные клавиатуры', computers_id, 1, 'computers/keyboards', 'https://example.com/categories/keyboards.jpg', true, 2)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert sample collections
DO $$
DECLARE
    apple_id uuid;
    samsung_id uuid;
    smartphones_id uuid;
    tablets_id uuid;
BEGIN
    SELECT id INTO apple_id FROM brands WHERE slug = 'apple';
    SELECT id INTO samsung_id FROM brands WHERE slug = 'samsung';
    SELECT id INTO smartphones_id FROM categories WHERE slug = 'smartphones';
    SELECT id INTO tablets_id FROM categories WHERE slug = 'tablets';

    INSERT INTO collections (name, slug, description, brand_id, category_id, image_url, is_active, sort_order) VALUES
    ('iPhone', 'iphone', 'Линейка смартфонов Apple', apple_id, smartphones_id, 'https://example.com/collections/iphone.jpg', true, 1),
    ('iPad', 'ipad', 'Линейка планшетов Apple', apple_id, tablets_id, 'https://example.com/collections/ipad.jpg', true, 2),
    ('Galaxy S', 'galaxy-s', 'Флагманские смартфоны Samsung', samsung_id, smartphones_id, 'https://example.com/collections/galaxy-s.jpg', true, 3),
    ('Galaxy Tab', 'galaxy-tab', 'Планшеты Samsung', samsung_id, tablets_id, 'https://example.com/collections/galaxy-tab.jpg', true, 4)
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert sample products
DO $$
DECLARE
    apple_id uuid;
    samsung_id uuid;
    xiaomi_id uuid;
    smartphones_id uuid;
    tablets_id uuid;
    headphones_id uuid;
    iphone_collection_id uuid;
    ipad_collection_id uuid;
    galaxy_s_collection_id uuid;
    kzt_currency_id uuid;
BEGIN
    SELECT id INTO apple_id FROM brands WHERE slug = 'apple';
    SELECT id INTO samsung_id FROM brands WHERE slug = 'samsung';
    SELECT id INTO xiaomi_id FROM brands WHERE slug = 'xiaomi';
    SELECT id INTO smartphones_id FROM categories WHERE slug = 'smartphones';
    SELECT id INTO tablets_id FROM categories WHERE slug = 'tablets';
    SELECT id INTO headphones_id FROM categories WHERE slug = 'headphones';
    SELECT id INTO iphone_collection_id FROM collections WHERE slug = 'iphone';
    SELECT id INTO ipad_collection_id FROM collections WHERE slug = 'ipad';
    SELECT id INTO galaxy_s_collection_id FROM collections WHERE slug = 'galaxy-s';
    SELECT id INTO kzt_currency_id FROM currencies WHERE code = 'KZT';

    INSERT INTO products (
        name, slug, sku, short_description, description,
        category_id, brand_id, collection_id,
        base_price, sale_price, currency_id,
        track_inventory, inventory_quantity, min_stock_level,
        weight, dimensions, images, thumbnail,
        specifications, status, is_featured,
        meta_title, meta_description, sort_order
    ) VALUES
    (
        'iPhone 15 Pro', 'iphone-15-pro', 'IPH15P-256-TN',
        'Новейший флагманский смартфон Apple с чипом A17 Pro',
        'iPhone 15 Pro предлагает профессиональную камеру, мощный процессор A17 Pro и премиальный дизайн из титана. Идеальный выбор для профессионалов и энтузиастов технологий.',
        smartphones_id, apple_id, iphone_collection_id,
        899000, 799000, kzt_currency_id,
        true, 50, 5,
        187, '{"length": 146.6, "width": 70.6, "height": 8.25}',
        ARRAY['https://example.com/products/iphone-15-pro-1.jpg', 'https://example.com/products/iphone-15-pro-2.jpg'],
        'https://example.com/products/iphone-15-pro-thumb.jpg',
        '{"display": "6.1 inch Super Retina XDR", "storage": "256GB", "camera": "48MP + 12MP + 12MP", "battery": "3274 mAh", "color": "Титан натуральный"}',
        'published', true,
        'iPhone 15 Pro 256GB - Купить в Казахстане',
        'Новый iPhone 15 Pro с чипом A17 Pro, профессиональной камерой и титановым корпусом. Доставка по Казахстану.',
        1
    ),
    (
        'Samsung Galaxy S24 Ultra', 'galaxy-s24-ultra', 'SGS24U-512-BK',
        'Топовый смартфон Samsung с S Pen и камерой 200MP',
        'Galaxy S24 Ultra - это мощный смартфон с встроенным стилусом S Pen, камерой 200MP и дисплеем Dynamic AMOLED 2X. Создан для максимальной продуктивности.',
        smartphones_id, samsung_id, galaxy_s_collection_id,
        749000, NULL, kzt_currency_id,
        true, 30, 3,
        232, '{"length": 162.3, "width": 79.0, "height": 8.6}',
        ARRAY['https://example.com/products/galaxy-s24-ultra-1.jpg', 'https://example.com/products/galaxy-s24-ultra-2.jpg'],
        'https://example.com/products/galaxy-s24-ultra-thumb.jpg',
        '{"display": "6.8 inch Dynamic AMOLED 2X", "storage": "512GB", "camera": "200MP + 50MP + 12MP + 10MP", "battery": "5000 mAh", "color": "Черный титан"}',
        'published', true,
        'Samsung Galaxy S24 Ultra 512GB - Купить в Казахстане',
        'Флагманский Galaxy S24 Ultra с камерой 200MP, S Pen и мощным процессором. Официальная гарантия.',
        2
    ),
    (
        'iPad Pro 12.9"', 'ipad-pro-12-9', 'IPP129-1TB-SG',
        'Профессиональный планшет Apple с чипом M2',
        'iPad Pro 12.9" с революционным чипом M2 обеспечивает невероятную производительность для профессиональных задач. Liquid Retina XDR дисплей и поддержка Apple Pencil.',
        tablets_id, apple_id, ipad_collection_id,
        1299000, 1199000, kzt_currency_id,
        true, 20, 2,
        682, '{"length": 280.6, "width": 214.9, "height": 6.4}',
        ARRAY['https://example.com/products/ipad-pro-12-9-1.jpg', 'https://example.com/products/ipad-pro-12-9-2.jpg'],
        'https://example.com/products/ipad-pro-12-9-thumb.jpg',
        '{"display": "12.9 inch Liquid Retina XDR", "storage": "1TB", "chip": "Apple M2", "camera": "12MP + 10MP", "color": "Серый космос"}',
        'published', false,
        'iPad Pro 12.9" 1TB - Профессиональный планшет Apple',
        'iPad Pro 12.9" с чипом M2, Liquid Retina XDR дисплеем и поддержкой Apple Pencil. Для профессионалов.',
        3
    ),
    (
        'Xiaomi Redmi Buds 4 Pro', 'redmi-buds-4-pro', 'XRB4P-BK',
        'Беспроводные наушники с активным шумоподавлением',
        'Redmi Buds 4 Pro предлагают качественный звук, активное шумоподавление и удобную посадку. Идеальны для повседневного использования и спорта.',
        headphones_id, xiaomi_id, NULL,
        45000, 39000, kzt_currency_id,
        true, 100, 10,
        52, '{"length": 30.9, "width": 21.4, "height": 23.4}',
        ARRAY['https://example.com/products/redmi-buds-4-pro-1.jpg', 'https://example.com/products/redmi-buds-4-pro-2.jpg'],
        'https://example.com/products/redmi-buds-4-pro-thumb.jpg',
        '{"driver": "11mm динамический драйвер", "anc": "Активное шумоподавление до 35dB", "battery": "6ч + 30ч с кейсом", "connectivity": "Bluetooth 5.3", "color": "Черный"}',
        'published', false,
        'Xiaomi Redmi Buds 4 Pro - Беспроводные наушники с ANC',
        'Беспроводные наушники Redmi Buds 4 Pro с шумоподавлением и качественным звуком. Выгодная цена.',
        4
    ),
    (
        'iPhone 14', 'iphone-14', 'IPH14-128-BL',
        'Популярный смартфон Apple предыдущего поколения',
        'iPhone 14 остается отличным выбором с мощным чипом A15 Bionic, улучшенными камерами и надежной конструкцией. Доступен в различных цветах.',
        smartphones_id, apple_id, iphone_collection_id,
        649000, 599000, kzt_currency_id,
        true, 75, 8,
        172, '{"length": 146.7, "width": 71.5, "height": 7.8}',
        ARRAY['https://example.com/products/iphone-14-1.jpg', 'https://example.com/products/iphone-14-2.jpg'],
        'https://example.com/products/iphone-14-thumb.jpg',
        '{"display": "6.1 inch Super Retina XDR", "storage": "128GB", "camera": "12MP + 12MP", "battery": "3279 mAh", "color": "Синий"}',
        'published', false,
        'iPhone 14 128GB - Надежный смартфон Apple',
        'iPhone 14 с чипом A15 Bionic, камерой 12MP и дисплеем Super Retina XDR. Отличное соотношение цены и качества.',
        5
    )
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Insert sample product variants
DO $$
DECLARE
    iphone15_id uuid;
    galaxy_s24_id uuid;
BEGIN
    SELECT id INTO iphone15_id FROM products WHERE slug = 'iphone-15-pro';
    SELECT id INTO galaxy_s24_id FROM products WHERE slug = 'galaxy-s24-ultra';

    -- iPhone 15 Pro variants
    INSERT INTO product_variants (product_id, name, sku, price_adjustment, inventory_quantity, attributes, is_active, sort_order) VALUES
    (iphone15_id, '256GB Титан натуральный', 'IPH15P-256-TN', 0, 20, '{"storage": "256GB", "color": "Титан натуральный"}', true, 1),
    (iphone15_id, '512GB Титан натуральный', 'IPH15P-512-TN', 100000, 15, '{"storage": "512GB", "color": "Титан натуральный"}', true, 2),
    (iphone15_id, '256GB Титан синий', 'IPH15P-256-TB', 0, 18, '{"storage": "256GB", "color": "Титан синий"}', true, 3),
    (iphone15_id, '512GB Титан синий', 'IPH15P-512-TB', 100000, 12, '{"storage": "512GB", "color": "Титан синий"}', true, 4);

    -- Galaxy S24 Ultra variants
    INSERT INTO product_variants (product_id, name, sku, price_adjustment, inventory_quantity, attributes, is_active, sort_order) VALUES
    (galaxy_s24_id, '256GB Черный титан', 'SGS24U-256-BK', -50000, 15, '{"storage": "256GB", "color": "Черный титан"}', true, 1),
    (galaxy_s24_id, '512GB Черный титан', 'SGS24U-512-BK', 0, 12, '{"storage": "512GB", "color": "Черный титан"}', true, 2),
    (galaxy_s24_id, '1TB Черный титан', 'SGS24U-1TB-BK', 150000, 8, '{"storage": "1TB", "color": "Черный титан"}', true, 3);
END $$;

-- Set published_at for published products
UPDATE products SET published_at = created_at WHERE status = 'published' AND published_at IS NULL;
