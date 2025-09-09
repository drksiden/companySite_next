import { supabase } from "@/lib/supabaseClient";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  status: "active" | "inactive" | "draft";
  images: string[];
  category_id?: string;
  brand_id?: string;
  attributes?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order: number;
  status: "active" | "inactive";
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  sort_order: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

// Products API
export const catalogAPI = {
  // Get all products with filters
  async getProducts(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, slug),
        brands(id, name, slug)
      `,
      )
      .order("created_at", { ascending: false });

    if (filters?.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters?.brand) {
      query = query.eq("brand_id", filters.brand);
    }

    if (filters?.minPrice) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1,
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get single product by ID or slug
  async getProduct(identifier: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, slug),
        brands(id, name, slug)
      `,
      )
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Create new product
  async createProduct(
    product: Omit<Product, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update product
  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from("products")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Delete product
  async deleteProduct(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Get all categories
  async getCategories(filters?: {
    parent_id?: string;
    status?: string;
    handle?: string;
    slug?: string;
    limit?: number;
  }) {
    let query = supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (filters?.parent_id !== undefined) {
      if (filters.parent_id === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", filters.parent_id);
      }
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.handle || filters?.slug) {
      const slugValue = filters.slug || filters.handle;
      query = query.eq("slug", slugValue);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get single category
  async getCategory(identifier: string) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Create category
  async createCategory(
    category: Omit<Category, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("categories")
      .insert(category)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update category
  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from("categories")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Delete category
  async deleteCategory(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Get all brands
  async getBrands(filters?: { status?: string }) {
    let query = supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true });

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Get single brand
  async getBrand(identifier: string) {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .or(`id.eq.${identifier},slug.eq.${identifier}`)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Create brand
  async createBrand(brand: Omit<Brand, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("brands")
      .insert(brand)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Update brand
  async updateBrand(id: string, updates: Partial<Brand>) {
    const { data, error } = await supabase
      .from("brands")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Delete brand
  async deleteBrand(id: string) {
    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Get featured products
  async getFeaturedProducts(limit = 10) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, slug),
        brands(id, name, slug)
      `,
      )
      .eq("status", "active")
      .eq("featured", true)
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  // Search products
  async searchProducts(query: string, limit = 20) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(id, name, slug),
        brands(id, name, slug)
      `,
      )
      .eq("status", "active")
      .or(
        `name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`,
      )
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
