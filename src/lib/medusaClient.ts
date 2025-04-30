import Medusa from '@medusajs/medusa-js';

// Типы
export interface ProductCategory {
  description: string;
  id: string;
  name: string;
  handle: string;
  parent_category_id: string | null;
  category_children: ProductCategory[];
}

export interface Product {
  id: string;
  title: string;
  description: string | null;
  handle: string;
  metadata: Record<string, unknown> | null;
  variants: Array<{
    id: string;
    inventory_quantity: number;
    prices: Array<{
      amount: number;
      currency_code: string;
    }>;
  }>;
}

export interface ProductCategoriesResponse {
  product_categories: ProductCategory[];
  count: number;
  offset: number;
  limit: number;
}

export interface ProductsResponse {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
const API_KEY = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || '';

export const medusaClient = new Medusa({
  baseUrl: BACKEND_URL,
  maxRetries: 3,
  publishableApiKey: API_KEY,
});

// Получение полного дерева категорий
export const fetchCategoriesTree = async (): Promise<ProductCategory[]> => {
  const { product_categories } = await medusaClient.productCategories.list({
    include_descendants_tree: true,
  });
  return product_categories;
};

// Поиск категории по handle в дереве
export const findCategoryByHandle = (
  categories: ProductCategory[],
  handle: string
): ProductCategory | null => {
  for (const category of categories) {
    if (category.handle === handle) return category;
    const foundInChildren = findCategoryByHandle(category.category_children, handle);
    if (foundInChildren) return foundInChildren;
  }
  return null;
};

// Загрузка категории по handle (через дерево)
export const fetchCategoryByHandle = async (
  handle: string
): Promise<{ product_category: ProductCategory | null }> => {
  try {
    const tree = await fetchCategoriesTree();
    const category = findCategoryByHandle(tree, handle.trim().toLowerCase());
    return { product_category: category || null };
  } catch (error) {
    console.error('Error fetching category by handle:', error);
    return { product_category: null };
  }
};

// Загрузка продуктов по ID категории
export const fetchProducts = async (categoryId?: string): Promise<ProductsResponse> => {
  const response = await medusaClient.products.list({
    category_id: categoryId ? [categoryId] : undefined,
  });
  return response;
};

export const fetchCategories = async (): Promise<ProductCategoriesResponse> => {
  return medusaClient.productCategories.list();
};

export const fetchProductByHandle = async (handle: string): Promise<Product | null> => {
  try {
    const response = await medusaClient.products.list({ handle });
    return response.products.length > 0 ? response.products[0] : null;
  } catch (error) {
    console.error('Error fetching product by handle:', error);
    return null;
  }
};
