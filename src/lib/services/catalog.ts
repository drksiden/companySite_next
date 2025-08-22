import { createServerClient, createAdminClient } from "@/lib/supabaseServer";
import { CatalogQuerySchema, type CatalogQuery } from "@/lib/schemas";
import { formatPrice } from "@/lib/utils";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  description?: string;
  base_price: number;
  sale_price?: number;
  thumbnail?: string;
  images: string[];
  inventory_quantity: number;
  track_inventory: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  view_count: number;
  sales_count: number;
  specifications?: Record<string, any>;
  brands?: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
  } | null;
  categories?: {
    id: string;
    name: string;
    slug: string;
    path?: string;
    level: number;
  } | null;
  currencies?: {
    id: string;
    code: string;
    symbol: string;
    name: string;
  } | null;
  collections?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface CatalogMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CatalogResponse {
  data: CatalogProduct[];
  meta: CatalogMeta;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  level: number;
  path?: string;
  image_url?: string;
  product_count?: number;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website?: string;
  product_count?: number;
}

export interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
}

/**
 * List products with filters, sorting, and pagination
 */
export async function listProducts(
  queryParams: unknown,
): Promise<CatalogResponse> {
  const params = CatalogQuerySchema.parse(queryParams);
  const supabase = await createServerClient();

  const {
    page,
    limit,
    sort,
    categories,
    brands,
    collections,
    minPrice,
    maxPrice,
    inStockOnly,
    search,
  } = params;
  const offset = (page - 1) * limit;

  // Build the query with joins for related data
  let query = supabase.from("products").select(
    `
      id,
      name,
      slug,
      sku,
      short_description,
      base_price,
      sale_price,
      thumbnail,
      images,
      inventory_quantity,
      track_inventory,
      is_featured,
      status,
      created_at,
      view_count,
      sales_count,
      brands(
        id,
        name,
        slug,
        logo_url
      ),
      categories(
        id,
        name,
        slug,
        path,
        level
      ),
      currencies(
        id,
        code,
        symbol,
        name
      ),
      collections(
        id,
        name,
        slug
      )
    `,
    { count: "exact" },
  );

  // Apply status filter (only active products)
  query = query.eq("status", "active");

  // Apply filters
  if (categories.length > 0) {
    query = query.in("category_id", categories);
  }

  if (brands.length > 0) {
    query = query.in("brand_id", brands);
  }

  if (collections.length > 0) {
    query = query.in("collection_id", collections);
  }

  if (minPrice && minPrice > 0) {
    query = query.gte("base_price", minPrice);
  }

  if (maxPrice && maxPrice > 0) {
    query = query.lte("base_price", maxPrice);
  }

  if (inStockOnly) {
    query = query.gt("inventory_quantity", 0);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // Apply sorting
  switch (sort) {
    case "price.asc":
      query = query.order("base_price", { ascending: true, nullsFirst: true });
      break;
    case "price.desc":
      query = query.order("base_price", { ascending: false, nullsFirst: true });
      break;
    case "name.asc":
      query = query.order("name", { ascending: true });
      break;
    case "name.desc":
      query = query.order("name", { ascending: false });
      break;
    case "created.desc":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("name", { ascending: true });
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Supabase error in listProducts:", error);
    throw new Error("Database error");
  }

  // Process products with joined data
  const products = (data || []).map((product) => {
    const finalPrice = product.sale_price || product.base_price;
    const isOnSale = !!(
      product.sale_price && product.sale_price < product.base_price
    );
    const discountPercentage = isOnSale
      ? Math.round(
          ((product.base_price - product.sale_price!) / product.base_price) *
            100,
        )
      : 0;

    // Process images - filter out empty and invalid URLs
    const images = product.images
      ? (Array.isArray(product.images) ? product.images : []).filter(
          (img) => img && typeof img === "string" && img.trim() !== "",
        )
      : [];

    // If thumbnail is empty, use first image from array
    const thumbnail =
      product.thumbnail && product.thumbnail.trim() !== ""
        ? product.thumbnail
        : images.length > 0
          ? images[0]
          : null;

    // Fix the data structure for single relations
    return {
      ...product,
      thumbnail,
      images,
      final_price: finalPrice,
      is_on_sale: isOnSale,
      discount_percentage: discountPercentage,
      formatted_price: formatPrice(finalPrice, "₸"),
      brands: Array.isArray(product.brands)
        ? product.brands[0] || null
        : product.brands,
      categories: Array.isArray(product.categories)
        ? product.categories[0] || null
        : product.categories,
      currencies: Array.isArray(product.currencies)
        ? product.currencies[0] || null
        : product.currencies,
      collections: Array.isArray(product.collections)
        ? product.collections[0] || null
        : product.collections,
    } as CatalogProduct;
  });

  const totalPages = Math.ceil((count || 0) / limit);

  const meta: CatalogMeta = {
    page,
    limit,
    total: count || 0,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };

  return { data: products, meta };
}

/**
 * Get all categories for filters
 */
export async function listCategories(): Promise<CategoryItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, parent_id, level, path, image_url")
    .order("name");

  if (error) {
    console.error("Supabase error in listCategories:", error);
    throw new Error("Database error");
  }

  return data || [];
}

/**
 * Get all brands for filters
 */
export async function listBrands(): Promise<BrandItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("brands")
    .select("id, name, slug, description, logo_url, website")
    .order("name");

  if (error) {
    console.error("Supabase error in listBrands:", error);
    throw new Error("Database error");
  }

  return data || [];
}

/**
 * Get all collections for filters
 */
export async function listCollections(): Promise<CollectionItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("collections")
    .select("id, name, slug, description, image_url")
    .order("name");

  if (error) {
    console.error("Supabase error in listCollections:", error);
    throw new Error("Database error");
  }

  return data || [];
}

/**
 * Get single product by ID or slug
 */
export async function getProduct(
  idOrSlug: string,
): Promise<CatalogProduct | null> {
  const supabase = createAdminClient();

  let query = supabase.from("products").select(
    `
      id,
      name,
      slug,
      sku,
      short_description,
      description,
      base_price,
      sale_price,
      thumbnail,
      images,
      inventory_quantity,
      track_inventory,
      is_featured,
      status,
      created_at,
      view_count,
      sales_count,
      specifications,
      brands(
        id,
        name,
        slug,
        logo_url,
        description,
        website_url
      ),
      categories(
        id,
        name,
        slug,
        path,
        level,
        description
      ),
      currencies(
        id,
        code,
        symbol,
        name
      ),
      collections(
        id,
        name,
        slug,
        description
      )
    `,
  );

  // Try by ID first, then by slug
  if (
    idOrSlug.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  ) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("Supabase error in getProduct:", error);
    throw new Error("Database error");
  }

  // Fix the data structure for single relations
  const processedData = {
    ...data,
    brands: Array.isArray(data.brands) ? data.brands[0] || null : data.brands,
    categories: Array.isArray(data.categories)
      ? data.categories[0] || null
      : data.categories,
    currencies: Array.isArray(data.currencies)
      ? data.currencies[0] || null
      : data.currencies,
    collections: Array.isArray(data.collections)
      ? data.collections[0] || null
      : data.collections,
  } as CatalogProduct;

  return processedData;
}

/**
 * Get category by ID or slug
 */
export async function getCategory(
  idOrSlug: string,
): Promise<CategoryItem | null> {
  const supabase = createAdminClient();

  let query = supabase.from("categories").select("*");

  if (
    idOrSlug.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  ) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Supabase error in getCategory:", error);
    throw new Error("Database error");
  }

  return data;
}

/**
 * Get brand by ID or slug
 */
export async function getBrand(idOrSlug: string): Promise<BrandItem | null> {
  const supabase = createAdminClient();

  let query = supabase.from("brands").select("*");

  if (
    idOrSlug.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  ) {
    query = query.eq("id", idOrSlug);
  } else {
    query = query.eq("slug", idOrSlug);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("Supabase error in getBrand:", error);
    throw new Error("Database error");
  }

  return data;
}

/**
 * Get products count by filters (for analytics)
 */
export async function getProductsCount(filters?: {
  categoryId?: string;
  brandId?: string;
  collectionId?: string;
}): Promise<number> {
  const supabase = createAdminClient();

  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");

  if (filters?.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (filters?.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }

  if (filters?.collectionId) {
    query = query.eq("collection_id", filters.collectionId);
  }

  const { count, error } = await query;

  if (error) {
    console.error("Supabase error in getProductsCount:", error);
    return 0;
  }

  return count || 0;
}
