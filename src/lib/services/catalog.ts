import { supabase } from "@/lib/supabaseClient";
import { Brand, Category, Collection, Product } from "@/types/catalog";

export const catalogService = {
  // Brands
  async getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async getBrand(id: string): Promise<Brand | null> {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data;
  },

  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Child categories
  async getChildCategories(parentId?: string): Promise<Category[]> {
    let query = supabase.from("categories").select("*").order("name");

    if (parentId) {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Collections
  async getCollections(
    categoryId?: string,
    brandId?: string,
  ): Promise<Collection[]> {
    let query = supabase.from("collections").select("*").order("name");

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }
    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  // Products
  async getProducts(filters?: {
    brandId?: string;
    categoryId?: string;
    collectionId?: string;
  }): Promise<Product[]> {
    let query = supabase.from("products").select("*").order("name");

    if (filters) {
      if (filters.brandId) query = query.eq("brand_id", filters.brandId);
      if (filters.categoryId)
        query = query.eq("category_id", filters.categoryId);
      if (filters.collectionId)
        query = query.eq("collection_id", filters.collectionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  },

  async getProductWithDetails(id: string): Promise<{
    product: Product;
    brand: Brand;
    collection: Collection | null;
    category: Category;
  } | null> {
    const product = await this.getProduct(id);
    if (!product) return null;

    if (!product.brand_id || !product.category_id) return null;

    const [brand, collection, category] = await Promise.all([
      this.getBrand(product.brand_id),
      product.collection_id
        ? this.getCollection(product.collection_id)
        : Promise.resolve(null),
      this.getCategory(product.category_id),
    ]);

    if (!brand || !category) return null;

    return {
      product,
      brand,
      collection,
      category,
    };
  },
};
