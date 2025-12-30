"use client";

import { useMemo } from "react";
import { CatalogProduct } from "@/lib/services/catalog";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductGridGroupedProps {
  products: CatalogProduct[];
  loading?: boolean;
  selectedCategories?: string[]; // ID или slug выбранных категорий
  subcategories?: Array<{ id: string; name: string }>; // Подкатегории текущей категории для группировки
}

interface ProductGroup {
  title: string;
  products: CatalogProduct[];
  priority: number;
}

// Функция для нормализации названия категории (заменяет пробелы на тире)
function normalizeCategoryName(categoryName: string): string {
  // Нормализуем пробелы и тире - заменяем множественные пробелы/тире на одинарное тире
  return categoryName.trim().replace(/[\s-]+/g, "-");
}

// Функция для нормализации названия группы (объединяет одинаковые группы)
function normalizeGroupName(groupName: string): string {
  // Просто нормализуем категории с тире
  return normalizeCategoryName(groupName.trim());
}

// Функция для форматирования названия группы для отображения
function formatGroupNameForDisplay(groupName: string): string {
  // Security Hub - без тире (с пробелом)
  if (groupName === "Security Hub" || groupName === "Security-Hub") {
    return "Security Hub";
  }
  
  // Дополнения-к-ПКП - убираем тире
  if (groupName.includes("Дополнения-к-ПКП") || groupName.includes("Дополнения-к-пкп")) {
    return groupName.replace(/Дополнения-к-ПКП/gi, "Дополнения к ПКП");
  }
  
  // Для остальных - оставляем как есть (с тире)
  return groupName;
}

// Функция для определения группы товара - по подкатегории или категории
function getProductGroup(
  product: CatalogProduct, 
  subcategories?: Array<{ id: string; name: string }>
): string {
  // Если есть подкатегории и товар находится в одной из них, группируем по подкатегории
  if (subcategories && subcategories.length > 0 && product.categories?.id) {
    const subcategory = subcategories.find(sub => sub.id === product.categories?.id);
    if (subcategory) {
      return normalizeCategoryName(subcategory.name);
    }
  }
  
  // Иначе группируем по категории товара из базы данных
  if (product.categories?.name) {
    return normalizeCategoryName(product.categories.name);
  }
  
  // По умолчанию
  return normalizeCategoryName("Другие товары");
}

// Функция для определения приоритета товара внутри группы
function getProductPriority(product: CatalogProduct): number {
  const productName = product.name.toLowerCase();
  const descriptionLower = product.description?.toLowerCase() || "";
  
  // 1. ПКП и главные устройства - высший приоритет
  if (
    productName.includes("пкп") || 
    productName.includes("приемно-контрольный") ||
    productName.includes("прибор приемно-контрольный") ||
    productName.includes("security hub") ||
    productName.includes("astra-812") || productName.includes("астра-812") ||
    descriptionLower.includes("приемно-контрольный прибор") ||
    descriptionLower.includes("ппкуп")
  ) {
    return 1;
  }
  
  // 2. Контроллеры и основные приборы
  if (
    productName.includes("контроллер") || 
    productName.includes("controller") ||
    (productName.includes("прибор") && !productName.includes("приемно"))
  ) {
    return 2;
  }
  
  // 3. Расширители и модули расширения
  if (
    productName.includes("расширитель") ||
    productName.includes("расширение") ||
    productName.includes("рпа") ||
    descriptionLower.includes("расширитель")
  ) {
    return 3;
  }
  
  // 4. Датчики и извещатели
  if (
    productName.includes("датчик") || 
    productName.includes("sensor") || 
    productName.includes("извещатель") ||
    productName.includes("извещатель") ||
    descriptionLower.includes("датчик") ||
    descriptionLower.includes("извещатель")
  ) {
    return 4;
  }
  
  // 5. Панели управления и индикаторы
  if (
    productName.includes("панель") || 
    productName.includes("hmi") ||
    productName.includes("индикатор") ||
    descriptionLower.includes("панель")
  ) {
    return 5;
  }
  
  // 6. Кнопки и ручные извещатели
  if (
    productName.includes("кнопка") ||
    productName.includes("ручной") ||
    productName.includes("button") ||
    descriptionLower.includes("кнопка") ||
    descriptionLower.includes("ручной извещатель")
  ) {
    return 6;
  }
  
  // 7. Блоки управления и реле
  if (
    productName.includes("блок") ||
    productName.includes("реле") ||
    productName.includes("relay") ||
    descriptionLower.includes("блок") ||
    descriptionLower.includes("реле")
  ) {
    return 7;
  }
  
  // 8. Модули связи (GSM, LAN, RS-485)
  if (
    productName.includes("модуль") || 
    productName.includes("module") ||
    productName.includes("gsm") ||
    productName.includes("lan") ||
    productName.includes("rs-485") ||
    descriptionLower.includes("модуль")
  ) {
    return 8;
  }
  
  // 9. Оповещатели и сирены
  if (
    productName.includes("сирена") || 
    productName.includes("siren") || 
    productName.includes("оповещатель") ||
    descriptionLower.includes("сирена") ||
    descriptionLower.includes("оповещатель")
  ) {
    return 9;
  }
  
  // 10. Блоки питания
  if (
    productName.includes("блок питания") || 
    productName.includes("power supply") || 
    productName.includes("источник питания") ||
    descriptionLower.includes("блок питания")
  ) {
    return 10;
  }
  
  // 11. Кабели и провода
  if (
    productName.includes("кабель") || 
    productName.includes("cable") || 
    productName.includes("провод") ||
    descriptionLower.includes("кабель")
  ) {
    return 11;
  }
  
  // 12. Корпуса и шкафы
  if (
    productName.includes("корпус") || 
    productName.includes("шкаф") || 
    productName.includes("cabinet") || 
    productName.includes("ящик") ||
    descriptionLower.includes("корпус") ||
    descriptionLower.includes("шкаф")
  ) {
    return 12;
  }
  
  // 13. Сервисное оборудование и инструменты
  if (
    productName.includes("пульт") ||
    productName.includes("тестер") ||
    productName.includes("сервис") ||
    descriptionLower.includes("сервисное") ||
    descriptionLower.includes("тестирование")
  ) {
    return 20;
  }
  
  // 14. Featured товары (если не попали в другие категории)
  if (product.is_featured) {
    return 15;
  }
  
  // Остальное
  return 13;
}

// Функция для сортировки товаров внутри группы
function sortProductsInGroup(products: CatalogProduct[], groupTitle: string): CatalogProduct[] {
  return [...products].sort((a, b) => {
    // 1. Сначала по приоритету устройства (ПКП первыми)
    const priorityA = getProductPriority(a);
    const priorityB = getProductPriority(b);
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // 2. Featured товары
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    
    // 3. По дате создания (новые первые)
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    if (dateB !== dateA) return dateB - dateA;
    
    // 4. По названию
    return a.name.localeCompare(b.name, "ru");
  });
}

// Приоритет групп для сортировки (по категориям)
const groupPriority: Record<string, number> = {
  // Важные категории
  "Приемно-контрольные-приборы": 10,
  "Контроллеры": 11,
  "Расширители": 12,
  "Датчики-и-извещатели": 13,
  "Панели-управления": 14,
  "Ручные-извещатели": 15,
  "Блоки-управления": 16,
  "Модули-расширения": 17,
  "Оповещатели": 18,
  "Блоки-питания": 19,
  "Кабельная-продукция": 20,
  "Корпуса-и-шкафы": 21,
  
  // Сервисное оборудование - внизу
  "Сервисное-оборудование": 999,
  "Инструменты": 998,
  
  // Остальные группы (категории) будут иметь приоритет 100 по умолчанию
};

function ProductGridGrouped({
  products,
  loading = false,
  selectedCategories = [],
  subcategories = [],
}: ProductGridGroupedProps) {
  // Группируем товары
  const groupedProducts = useMemo(() => {
    const groupsMap = new Map<string, CatalogProduct[]>();
    
    products.forEach((product) => {
      const groupName = normalizeGroupName(getProductGroup(product, subcategories));
      
      if (!groupsMap.has(groupName)) {
        groupsMap.set(groupName, []);
      }
      groupsMap.get(groupName)!.push(product);
    });
    
    // Преобразуем в массив групп и сортируем
    const groups: ProductGroup[] = Array.from(groupsMap.entries()).map(([title, products]) => ({
      title,
      products: sortProductsInGroup(products, title),
      priority: groupPriority[title] || 100,
    }));
    
    // Сортируем группы по приоритету, затем по названию
    groups.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.title.localeCompare(b.title, "ru");
    });
    
    return groups;
  }, [products]);

  const gridClasses =
    "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, groupIdx) => (
          <div key={groupIdx} className="space-y-4">
            <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
            <div className={cn("grid gap-4 md:gap-6", gridClasses)}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="group relative h-full rounded-xl bg-[var(--card-bg)] shadow-sm animate-pulse"
                >
                  <div className="relative w-full h-40 rounded-t-xl bg-[var(--image-bg)]" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted-foreground/30 rounded w-3/4" />
                    <div className="h-3 bg-muted-foreground/30 rounded w-1/2" />
                    <div className="h-5 bg-muted-foreground/30 rounded w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-2xl font-semibold">
          Товары не найдены
        </p>
        <p className="text-muted-foreground mt-2">
          Попробуйте изменить параметры поиска или фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedProducts.map((group, groupIndex) => (
        <motion.div
          key={group.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: groupIndex * 0.1,
            ease: "easeOut",
          }}
          className="space-y-4"
        >
          {/* Заголовок группы */}
          <div className="flex items-center gap-3">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {formatGroupNameForDisplay(group.title)}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {group.products.length} {group.products.length === 1 ? "товар" : group.products.length < 5 ? "товара" : "товаров"}
            </span>
          </div>

          {/* Сетка товаров группы */}
          <div className={cn("grid gap-4 md:gap-6", gridClasses)}>
            {group.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: groupIndex * 0.1 + Math.min(index * 0.05, 0.5),
                  ease: "easeOut",
                }}
              >
                <ProductCard 
                  product={product} 
                  priority={groupIndex === 0 && index < 8}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ProductGridGrouped;

