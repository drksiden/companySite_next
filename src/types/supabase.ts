export interface Category {
  id: string; // Assuming UUID, adjust if different
  created_at?: string; // Supabase adds this by default
  name: string;
  handle: string; // For URL slugs
  description?: string;
  parent_id?: string | null; // For category hierarchy
  image_url?: string; // For Cloudflare R2 image
  rank?: number | null; // Optional field for sorting categories
  // Add any other fields you expect from your Supabase 'categories' table
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
  id: string; // Assuming UUID, adjust if different
  created_at?: string; // Supabase adds this by default
  name: string;
  description?: string | null; // Made explicitly nullable
  image_urls?: string[] | null; // Made explicitly nullable
  category_id?: string | null; // Foreign key to categories table
  brand_id?: string | null; // Keep brand_id for direct reference if needed
  brand?: Brand | null; // To hold the joined brand object
  handle?: string | null; 
  sku?: string | null; // Stock Keeping Unit
  price?: number | null; // Current selling price
  original_price?: number | null; // Original price, for showing discounts
  currency_code?: string | null; // Currency code (e.g., KZT, USD)
  stock_quantity?: number | null; // Available stock quantity
  allow_backorder?: boolean | null; // Whether backorders are allowed
  // Add any other fields you expect (e.g., dimensions, weight, metadata)
  metadata?: Record<string, any> | null;
  // Consider adding fields like:
  // status?: 'draft' | 'published' | 'archived';
  // tags?: string[];
  // related_product_ids?: string[];
}
