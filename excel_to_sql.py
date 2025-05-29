import pandas as pd
from unidecode import unidecode
import re

# Настройки
EXCEL_FILE = 'Прайс ТЕКО рассылка.xls'  # Имя вашего файла
SHEET_NAME = 0  # Или имя листа, если нужно
OUTPUT_SQL = 'output.sql'

# Функция для генерации slug
def slugify(text):
    text = unidecode(str(text)).lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

# Загрузка Excel
print('Чтение Excel...')
df = pd.read_excel(EXCEL_FILE, sheet_name=SHEET_NAME)

# Ожидаемые колонки: title, description, price, brand, collection, subcategory
# Если названия другие — скорректируйте ниже

sql_lines = []
for idx, row in df.iterrows():
    title = str(row.get('title') or row.get('Название') or row.get('Product') or '').replace("'", "''")
    description = str(row.get('description') or row.get('Описание') or '').replace("'", "''")
    price = row.get('price') or row.get('Цена') or 0
    brand = str(row.get('brand') or row.get('Бренд') or '').replace("'", "''")
    collection = str(row.get('collection') or row.get('Коллекция') or '').replace("'", "''")
    subcategory = str(row.get('subcategory') or row.get('Подкатегория') or '').replace("'", "''")
    slug = slugify(title)

    # Пример для вставки с подзапросами (как у вас)
    sql = f"""
INSERT INTO products (title, description, price, slug, brand_id, collection_id, subcategory_id)
SELECT '{title}', '{description}', {price}, '{slug}',
  (SELECT id FROM brands WHERE name = '{brand}' LIMIT 1),
  (SELECT id FROM collections WHERE name = '{collection}' LIMIT 1),
  (SELECT id FROM subcategories WHERE name = '{subcategory}' LIMIT 1)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  brand_id = EXCLUDED.brand_id,
  collection_id = EXCLUDED.collection_id,
  subcategory_id = EXCLUDED.subcategory_id;
"""
    sql_lines.append(sql.strip())

with open(OUTPUT_SQL, 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(sql_lines))

print(f'Готово! SQL-запросы сохранены в {OUTPUT_SQL}') 