import { supabase } from '@/lib/supabaseClient';
import { Brand, Category, Subcategory, Collection, Product, ProductVariant } from '../types/catalog';

export const catalogService = {
  // Brands
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getBrand(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Subcategories
  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    let query = supabase
      .from('subcategories')
      .select('*')
      .order('name');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getSubcategory(id: string): Promise<Subcategory | null> {
    const { data, error } = await supabase
      .from('subcategories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Collections
  async getCollections(subcategoryId?: string, brandId?: string): Promise<Collection[]> {
    let query = supabase
      .from('collections')
      .select('*')
      .order('name');

    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId);
    }
    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Products
  async getProducts(filters?: {
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
    collectionId?: string;
  }): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .order('title');

    if (filters) {
      if (filters.brandId) query = query.eq('brand_id', filters.brandId);
      if (filters.subcategoryId) query = query.eq('subcategory_id', filters.subcategoryId);
      if (filters.collectionId) query = query.eq('collection_id', filters.collectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getProductWithDetails(id: string): Promise<{
    product: Product;
    brand: Brand;
    collection: Collection | null;
    subcategory: Subcategory;
    category: Category;
    variants: ProductVariant[];
  } | null> {
    const product = await this.getProduct(id);
    if (!product) return null;

    const [brand, collection, subcategory, variants] = await Promise.all([
      this.getBrand(product.brand_id),
      product.collection_id ? this.getCollection(product.collection_id) : Promise.resolve(null),
      this.getSubcategory(product.subcategory_id),
      this.getProductVariants(id),
    ]);

    if (!brand || !subcategory) return null;

    const category = await this.getCategory(subcategory.category_id);
    if (!category) return null;

    return {
      product,
      brand,
      collection,
      subcategory,
      category,
      variants,
    };
  },

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('title');

    if (error) throw error;
    return data;
  },

  async getVariant(id: string): Promise<ProductVariant | null> {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },
}; 