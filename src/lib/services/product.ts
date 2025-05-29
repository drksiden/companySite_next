import { supabase } from '@/lib/supabaseClient';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  images: string[];
  created_at: string;
  updated_at: string;
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

export const productService = {
  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async getVariant(id: string): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async getProductWithVariant(variantId: string): Promise<{ product: Product; variant: ProductVariant } | null> {
    const variant = await this.getVariant(variantId);
    if (!variant) return null;

    const product = await this.getProduct(variant.product_id);
    if (!product) return null;

    return { product, variant };
  },
}; 