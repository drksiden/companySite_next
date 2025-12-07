import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CatalogProduct, CategoryItem, BrandItem } from "@/lib/services/catalog";

// Query Keys
export const catalogKeys = {
  all: ["catalog"] as const,
  products: (params?: any) => [...catalogKeys.all, "products", params] as const,
  product: (slug: string) => [...catalogKeys.all, "product", slug] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  brands: () => [...catalogKeys.all, "brands"] as const,
  categoryProducts: (categoryPath: string, slugs: string[]) => 
    [...catalogKeys.all, "category-products", categoryPath, slugs] as const,
  relatedProducts: (productId: string, categoryId?: string, brandId?: string) =>
    [...catalogKeys.all, "related-products", productId, categoryId, brandId] as const,
};

// Hook для получения списка товаров через API
export function useProducts(params?: {
  page?: number;
  limit?: number;
  sort?: string;
  categories?: string[];
  brands?: string[];
  collections?: string[];
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("type", "products");
      queryParams.set("page", String(params?.page || 1));
      queryParams.set("limit", String(params?.limit || 50));
      queryParams.set("sort", params?.sort || "name.asc");

      if (params?.search) queryParams.set("search", params.search);
      if (params?.categories && params.categories.length > 0) {
        queryParams.set("category", params.categories.join(","));
      }
      if (params?.brands && params.brands.length > 0) {
        queryParams.set("brand", params.brands.join(","));
      }
      if (params?.collections && params.collections.length > 0) {
        queryParams.set("collections", params.collections.join(","));
      }
      if (params?.minPrice) queryParams.set("minPrice", String(params.minPrice));
      if (params?.maxPrice) queryParams.set("maxPrice", String(params.maxPrice));
      if (params?.inStockOnly) queryParams.set("inStockOnly", "true");

      const response = await fetch(`/api/catalog?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }
      return { data: result.data, meta: result.meta };
    },
    staleTime: 0, // Не кэшируем - всегда загружаем свежие данные
    gcTime: 0, // Не храним в кэше
  });
}

// Hook для получения одного товара через API
export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: async () => {
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch product");
      }
      const result = await response.json();
      return result.product || null;
    },
    enabled: !!slug,
    staleTime: 0, // Не кэшируем - всегда загружаем свежие данные
    gcTime: 0, // Не храним в кэше
  });
}

// Hook для получения категорий через API
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: async () => {
      const response = await fetch("/api/catalog/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 0, // Не кэшируем - всегда загружаем свежие данные
  });
}

// Hook для получения брендов через API
export function useBrands() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: async () => {
      const response = await fetch("/api/catalog/brands");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      const result = await response.json();
      return result.data || [];
    },
    staleTime: 0, // Не кэшируем - всегда загружаем свежие данные
  });
}

// Hook для инвалидации кэша товаров
export function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: catalogKeys.products() });
  };
}

// Hook для инвалидации кэша конкретного товара
export function useInvalidateProduct() {
  const queryClient = useQueryClient();
  return (slug: string) => {
    queryClient.invalidateQueries({ queryKey: catalogKeys.product(slug) });
  };
}

