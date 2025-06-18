export interface Category {
  id: string;
  created_at?: string;
  name: string;
  handle: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string;
  rank?: number | null;
}

export interface Brand {
  id: string;
  created_at?: string;
  name: string;
  handle?: string | null;
  logo_url?: string | null;
  description?: string | null;
}

export interface Product {
  id: string;
  created_at?: string;
  name: string;
  description?: string | null;
  image_urls?: string[] | null;
  category_id?: string | null;
  brand_id?: string | null;
  // Связанные данные от Supabase joins
  brands?: Brand | null; // Изменили с brand на brands
  categories?: Category | null; // Добавили categories для join
  handle?: string | null; 
  sku?: string | null;
  price?: number | null;
  original_price?: number | null;
  currency_code?: string | null;
  stock_quantity?: number | null;
  allow_backorder?: boolean | null;
  metadata?: Record<string, any> | null;
}

// Вспомогательные типы для работы с продуктами
export interface ProductWithBrand extends Product {
  brands: Brand;
}

export interface ProductWithCategory extends Product {
  categories: Category;
}

export interface ProductWithRelations extends Product {
  brands?: Brand;
  categories?: Category;
}