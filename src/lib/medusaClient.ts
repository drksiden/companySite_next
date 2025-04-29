import Medusa from '@medusajs/medusa-js';

// Define shared types
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

export const fetchCategories = async (): Promise<ProductCategoriesResponse> => {
  const response = await medusaClient.productCategories.list({ include_descendants_tree: true });
  return response;
};

export const fetchProducts = async (categoryId?: string): Promise<ProductsResponse> => {
  const response = await medusaClient.products.list({
    category_id: categoryId ? [categoryId] : undefined,
  });
  return response;
};