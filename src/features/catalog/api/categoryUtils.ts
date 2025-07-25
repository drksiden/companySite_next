import type { Category, CategoryTree } from "@/types/catalog";

/**
 * Построение дерева категорий из плоского списка
 */
export const buildCategoryTree = (categories: Category[]): CategoryTree[] => {
  const categoryMap = new Map<string, CategoryTree>();
  const rootCategories: CategoryTree[] = [];

  // Создаем мапу всех категорий
  categories.forEach((category) => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Строим дерево
  categories.forEach((category) => {
    const categoryNode = categoryMap.get(category.id)!;

    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent) {
        parent.children.push(categoryNode);
      }
    } else {
      rootCategories.push(categoryNode);
    }
  });

  return rootCategories;
};

/**
 * Найти категорию по ID в дереве
 */
export const findCategoryInTree = (
  tree: CategoryTree[],
  categoryId: string,
): CategoryTree | null => {
  for (const category of tree) {
    if (category.id === categoryId) {
      return category;
    }
    const found = findCategoryInTree(category.children, categoryId);
    if (found) {
      return found;
    }
  }
  return null;
};

/**
 * Получить все ID категорий включая дочерние
 */
export const getAllCategoryIds = (category: CategoryTree): string[] => {
  const ids = [category.id];
  category.children.forEach((child) => {
    ids.push(...getAllCategoryIds(child));
  });
  return ids;
};

/**
 * Получить путь к категории (хлебные крошки)
 */
export const getCategoryPath = (
  tree: CategoryTree[],
  categoryId: string,
  path: Category[] = [],
): Category[] | null => {
  for (const category of tree) {
    const currentPath = [...path, category];

    if (category.id === categoryId) {
      return currentPath;
    }

    const found = getCategoryPath(category.children, categoryId, currentPath);
    if (found) {
      return found;
    }
  }
  return null;
};

/**
 * Фильтровать категории по уровню
 */
export const filterCategoriesByLevel = (
  categories: Category[],
  level: number,
): Category[] => {
  return categories.filter((category) => category.level === level);
};

/**
 * Получить корневые категории
 */
export const getRootCategories = (categories: Category[]): Category[] => {
  return categories.filter((category) => !category.parent_id);
};

/**
 * Получить дочерние категории
 */
export const getChildCategories = (
  categories: Category[],
  parentId: string,
): Category[] => {
  return categories.filter((category) => category.parent_id === parentId);
};

/**
 * Проверить, является ли категория потомком другой категории
 */
export const isDescendantOf = (
  categories: Category[],
  categoryId: string,
  potentialAncestorId: string,
): boolean => {
  const category = categories.find((c) => c.id === categoryId);
  if (!category || !category.parent_id) {
    return false;
  }

  if (category.parent_id === potentialAncestorId) {
    return true;
  }

  return isDescendantOf(categories, category.parent_id, potentialAncestorId);
};

/**
 * Сортировать категории по sort_order и имени
 */
export const sortCategories = (categories: Category[]): Category[] => {
  return [...categories].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return a.name.localeCompare(b.name, 'ru');
  });
};

/**
 * Получить максимальный уровень вложенности
 */
export const getMaxLevel = (categories: Category[]): number => {
  return Math.max(...categories.map((cat) => cat.level), 0);
};

/**
 * Преобразовать дерево категорий в плоский список
 */
export const flattenCategoryTree = (tree: CategoryTree[]): Category[] => {
  const result: Category[] = [];

  const flatten = (categories: CategoryTree[]) => {
    categories.forEach((category) => {
      const { children, ...categoryData } = category;
      result.push(categoryData);
      if (children.length > 0) {
        flatten(children);
      }
    });
  };

  flatten(tree);
  return result;
};
