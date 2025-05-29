export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Collection {
  id: string;
  subcategory_id: string;
  brand_id: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
  subcategory?: Subcategory;
  brand?: Brand;
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  thumbnail?: string;
  images?: string[];
  brand_id: string;
  collection_id?: string;
  subcategory_id: string;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  collection?: Collection;
  subcategory?: Subcategory;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  price: number;
  sku?: string;
  created_at: string;
  updated_at: string;
} 