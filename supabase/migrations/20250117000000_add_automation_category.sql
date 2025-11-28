-- Добавление категории "Автоматизация" для товаров Flexem
-- Эта миграция создает корневую категорию "Автоматизация" и подкатегории для Flexem

-- Создаем категорию "Автоматизация" (корневая категория, level 0)
INSERT INTO categories (
  name,
  slug,
  description,
  level,
  path,
  is_active,
  sort_order,
  meta_title,
  meta_description
) VALUES (
  'Автоматизация',
  'automation',
  'Оборудование для автоматизации и управления промышленными процессами. HMI-панели, ПЛК, сервоприводы, IoT-решения от Flexem.',
  0,
  'automation',
  true,
  0,
  'Автоматизация - Оборудование Flexem для промышленной автоматизации',
  'Современное оборудование для автоматизации: HMI-панели, ПЛК, сервоприводы и IoT-шлюзы от Flexem. Решения для промышленности и бизнеса в Казахстане.'
)
ON CONFLICT DO NOTHING;

-- Создаем подкатегории для Flexem в разделе Автоматизация
DO $$
DECLARE
  automation_category_id UUID;
BEGIN
  -- Получаем ID категории "Автоматизация"
  SELECT id INTO automation_category_id 
  FROM categories 
  WHERE slug = 'automation' 
  LIMIT 1;

  IF automation_category_id IS NOT NULL THEN
    -- HMI-панели
    INSERT INTO categories (
      name,
      slug,
      description,
      parent_id,
      level,
      path,
      is_active,
      sort_order,
      meta_title,
      meta_description
    ) VALUES (
      'HMI-панели',
      'hmi-panels',
      'HMI-панели Flexem для визуализации и управления промышленными процессами',
      automation_category_id,
      1,
      'automation/hmi-panels',
      true,
      1,
      'HMI-панели Flexem - Панели оператора для промышленной автоматизации',
      'HMI-панели Flexem обеспечивают удобный интерфейс для управления и мониторинга промышленного оборудования'
    )
    ON CONFLICT DO NOTHING;

    -- ПЛК контроллеры
    INSERT INTO categories (
      name,
      slug,
      description,
      parent_id,
      level,
      path,
      is_active,
      sort_order,
      meta_title,
      meta_description
    ) VALUES (
      'ПЛК контроллеры',
      'plk-controllers',
      'Программируемые логические контроллеры Flexem для автоматизации производственных процессов',
      automation_category_id,
      1,
      'automation/plk-controllers',
      true,
      2,
      'ПЛК контроллеры Flexem - Программируемые логические контроллеры',
      'ПЛК контроллеры Flexem для управления автоматизированными системами и производственными линиями'
    )
    ON CONFLICT DO NOTHING;

    -- Сервоприводы
    INSERT INTO categories (
      name,
      slug,
      description,
      parent_id,
      level,
      path,
      is_active,
      sort_order,
      meta_title,
      meta_description
    ) VALUES (
      'Сервоприводы',
      'servo-drives',
      'Высокопроизводительные сервоприводы Flexem для точного управления движением',
      automation_category_id,
      1,
      'automation/servo-drives',
      true,
      3,
      'Сервоприводы Flexem - Высокопроизводительные сервоприводы',
      'Сервоприводы Flexem обеспечивают высокоэффективное управление движением с высоким откликом и высокой точностью. Мощность от 100 Вт до 7,5 кВт'
    )
    ON CONFLICT DO NOTHING;

    -- IoT-шлюзы
    INSERT INTO categories (
      name,
      slug,
      description,
      parent_id,
      level,
      path,
      is_active,
      sort_order,
      meta_title,
      meta_description
    ) VALUES (
      'IoT-шлюзы',
      'iot-gateways',
      'IoT-шлюзы Flexem серии Fbox для подключения промышленных устройств к облачным сервисам',
      automation_category_id,
      1,
      'automation/iot-gateways',
      true,
      4,
      'IoT-шлюзы Flexem - Подключение промышленных устройств к облаку',
      'IoT-шлюзы Flexem серии Fbox обеспечивают подключение к Ethernet, 4G и WiFi для локальных промышленных терминалов: ПЛК, HMI, инверторы, датчики'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Обновляем описание бренда Flexem, если оно устарело
UPDATE brands 
SET 
  description = 'Производитель оборудования для промышленной автоматизации: HMI-панели, ПЛК, сервоприводы, IoT-решения',
  updated_at = timezone('utc'::text, now())
WHERE name = 'Flexem' 
  AND (description IS NULL OR description = 'Производитель систем видеонаблюдения');

-- Создаем индексы для быстрого поиска (если их еще нет)
-- Примечание: индексы уже должны существовать на slug и parent_id, но создаем частичные для оптимизации
CREATE INDEX IF NOT EXISTS idx_categories_slug_automation ON categories(slug) WHERE slug = 'automation' OR slug LIKE 'automation/%';

