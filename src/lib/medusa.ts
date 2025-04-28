import Medusa from '@medusajs/medusa-js';
import type { StoreProductCategoriesResponse, StoreProductsListResponse } from '@medusajs/medusa';

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

export const medusaClient = new Medusa({ baseUrl: BACKEND_URL });

// Fetch categories with subcategories
export const fetchCategories = async (): Promise<StoreProductCategoriesResponse> => {
  return medusaClient.productCategories.list({ include_descendants_tree: true });
};

// Fetch products with optional category filter
export const fetchProducts = async (categoryId?: string): Promise<StoreProductsListResponse> => {
  return medusaClient.products.list(
    categoryId ? { category_id: [categoryId] } : undefined
  );
};