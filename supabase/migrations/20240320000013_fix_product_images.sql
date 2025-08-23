-- Fix product images with real local images
-- This migration updates the test products to use actual local images instead of broken example.com URLs

-- Update existing products with real local images
UPDATE products SET
    images = ARRAY['/images/teko/teko-astra-a.png', '/images/teko/teko-astra-prime.png'],
    thumbnail = '/images/teko/teko-astra-a.png'
WHERE slug = 'iphone-15-pro';

UPDATE products SET
    images = ARRAY['/images/teko/teko-astra-r.png', '/images/teko/teko-astra-ri-m.png'],
    thumbnail = '/images/teko/teko-astra-r.png'
WHERE slug = 'galaxy-s24-ultra';

UPDATE products SET
    images = ARRAY['/images/teko/teko-sh.png', '/images/teko/teko-main-visual.png'],
    thumbnail = '/images/teko/teko-sh.png'
WHERE slug = 'ipad-pro-12-9';

UPDATE products SET
    images = ARRAY['/images/placeholder-product.svg'],
    thumbnail = '/images/placeholder-product.svg'
WHERE slug = 'redmi-buds-4-pro';

-- Add more realistic TEKO products with proper images
DO $$
DECLARE
    teko_brand_id uuid;
    security_cat_id uuid;
    kzt_currency_id uuid;
BEGIN
    -- Get TEKO brand ID (create if not exists)
    INSERT INTO brands (name, slug, description, logo_url, website, country, is_active, sort_order) VALUES
    ('TEKO', 'teko', 'НПО "ТЕКО" - производитель систем безопасности', '/images/logos/teko-logo.svg', 'https://teko.ru', 'Россия', true, 10)
    ON CONFLICT (slug) DO UPDATE SET
        logo_url = EXCLUDED.logo_url,
        description = EXCLUDED.description;

    SELECT id INTO teko_brand_id FROM brands WHERE slug = 'teko';

    -- Create security systems category
    INSERT INTO categories (name, slug, description, parent_id, level, path, image_url, is_active, sort_order) VALUES
    ('Системы безопасности', 'security-systems', 'Охранные системы и оборудование', NULL, 0, 'security-systems', '/images/placeholder-category.svg', true, 10)
    ON CONFLICT (slug) DO NOTHING;

    SELECT id INTO security_cat_id FROM categories WHERE slug = 'security-systems';
    SELECT id INTO kzt_currency_id FROM currencies WHERE code = 'KZT';

    -- Insert TEKO products with real images
    INSERT INTO products (
        name, slug, sku, short_description, description,
        category_id, brand_id, collection_id,
        base_price, sale_price, currency_id,
        track_inventory, inventory_quantity, min_stock_level,
        weight, images, thumbnail,
        specifications, status, is_featured,
        meta_title, meta_description, sort_order
    ) VALUES
    (
        'Астра-812 Pro', 'astra-812-pro', 'ASTRA-812-PRO',
        'Профессиональная радиоканальная система охраны',
        'Астра-812 Pro - современная радиоканальная система охраны с расширенными возможностями мониторинга и управления. Поддерживает до 32 радиоканальных извещателей.',
        security_cat_id, teko_brand_id, NULL,
        45000, 42000, kzt_currency_id,
        true, 25, 5,
        500, ARRAY['/images/teko/teko-astra-a.png', '/images/teko/teko-astra-prime.png'],
        '/images/teko/teko-astra-a.png',
        '{"zones": "32 радиоканала", "frequency": "868 МГц", "range": "до 1000м", "power": "12В"}',
        'active', true,
        'Астра-812 Pro - Радиоканальная система охраны TEKO',
        'Профессиональная система охраны Астра-812 Pro от НПО ТЕКО. Поддержка 32 зон, дальность до 1000м.',
        1
    ),
    (
        'Астра-РИ-М', 'astra-ri-m', 'ASTRA-RI-M',
        'Радиоканальный извещатель движения',
        'Астра-РИ-М - беспроводной инфракрасный извещатель движения для систем охранной сигнализации. Работает в радиодиапазоне 868 МГц.',
        security_cat_id, teko_brand_id, NULL,
        8500, NULL, kzt_currency_id,
        true, 100, 10,
        150, ARRAY['/images/teko/teko-astra-ri-m.png'],
        '/images/teko/teko-astra-ri-m.png',
        '{"detection_range": "12м", "frequency": "868 МГц", "battery": "3В литий", "temperature": "-10 до +55°C"}',
        'active', false,
        'Астра-РИ-М - Радиоканальный датчик движения',
        'Беспроводной датчик движения Астра-РИ-М от ТЕКО. Дальность обнаружения 12м, частота 868 МГц.',
        2
    ),
    (
        'Астра-Р', 'astra-r', 'ASTRA-R',
        'Радиоканальный ретранслятор',
        'Астра-Р - радиоканальный ретранслятор для увеличения дальности связи в системах охранной сигнализации.',
        security_cat_id, teko_brand_id, NULL,
        12000, 11500, kzt_currency_id,
        true, 50, 5,
        200, ARRAY['/images/teko/teko-astra-r.png'],
        '/images/teko/teko-astra-r.png',
        '{"frequency": "868 МГц", "range": "до 2000м", "power": "12В", "channels": "32"}',
        'active', false,
        'Астра-Р - Радиоканальный ретранслятор TEKO',
        'Ретранслятор Астра-Р для увеличения дальности радиосвязи в системах ТЕКО до 2000м.',
        3
    ),
    (
        'Астра-СШ', 'astra-sh', 'ASTRA-SH',
        'Радиоканальный шлейфовый модуль',
        'Астра-СШ - радиоканальный модуль для подключения проводных извещателей к беспроводной системе охраны.',
        security_cat_id, teko_brand_id, NULL,
        7500, NULL, kzt_currency_id,
        true, 75, 10,
        120, ARRAY['/images/teko/teko-sh.png'],
        '/images/teko/teko-sh.png',
        '{"inputs": "2 шлейфа", "frequency": "868 МГц", "battery": "3В литий", "resistance": "1-20 кОм"}',
        'active', false,
        'Астра-СШ - Шлейфовый радиомодуль TEKO',
        'Радиоканальный модуль Астра-СШ для подключения проводных датчиков к системе ТЕКО.',
        4
    )
    ON CONFLICT (slug) DO UPDATE SET
        images = EXCLUDED.images,
        thumbnail = EXCLUDED.thumbnail,
        base_price = EXCLUDED.base_price,
        sale_price = EXCLUDED.sale_price;
END $$;

-- Update any remaining products with example.com URLs to use placeholder
UPDATE products
SET
    thumbnail = '/images/placeholder-product.svg',
    images = ARRAY['/images/placeholder-product.svg']
WHERE
    thumbnail LIKE '%example.com%'
    OR EXISTS (SELECT 1 FROM unnest(images) AS img WHERE img LIKE '%example.com%');

-- Update categories with placeholder images if they have example.com URLs
UPDATE categories
SET image_url = '/images/placeholder-category.svg'
WHERE image_url LIKE '%example.com%';

-- Update brands with placeholder logos if they have example.com URLs
UPDATE brands
SET logo_url = '/images/placeholder-product.svg'
WHERE logo_url LIKE '%example.com%';

-- Update collections with placeholder images if they have example.com URLs
UPDATE collections
SET image_url = '/images/placeholder-product.svg'
WHERE image_url LIKE '%example.com%';
