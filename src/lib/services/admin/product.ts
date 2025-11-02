// lib/services/admin/product.ts
import { Product } from "@/types/catalog";

export interface ProductFilters {
  search?: string;
  status?: string;
  category?: string;
  brand?: string;
  featured?: string;
}

export interface ProductPagination {
  limit: number;
  offset: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface CreateProductData {
  formData: FormData;
}

export interface UpdateProductData {
  id: string;
  formData: FormData;
}

export interface UploadInfo {
  imagesUploaded: number;
  documentsUploaded: number;
  errors?: string[];
}

export const productService = {
  async listProducts(
    filters: ProductFilters = {},
    pagination: ProductPagination = { limit: 20, offset: 0 }
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams({
      limit: pagination.limit.toString(),
      offset: pagination.offset.toString(),
    });

    if (filters.search) params.append("search", filters.search);
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters.category && filters.category !== "all") {
      params.append("category", filters.category);
    }
    if (filters.brand && filters.brand !== "all") {
      params.append("brand", filters.brand);
    }
    if (filters.featured && filters.featured !== "all") {
      params.append("featured", filters.featured);
    }

    const response = await fetch(`/api/admin/products?${params}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to fetch products" }));
      throw new Error(error.error || "Failed to fetch products");
    }

    const data = await response.json();
    return {
      products: data.products || [],
      total: data.total || 0,
      hasMore: data.hasMore || false,
    };
  },

  async createProduct(data: CreateProductData): Promise<Product & { uploadInfo?: UploadInfo }> {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      body: data.formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to create product" }));
      throw new Error(error.error || "Failed to create product");
    }

    return await response.json();
  },

  async updateProduct(
    data: UpdateProductData
  ): Promise<Product & { uploadInfo?: UploadInfo }> {
    const response = await fetch("/api/admin/products", {
      method: "PUT",
      body: data.formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to update product" }));
      throw new Error(error.error || "Failed to update product");
    }

    return await response.json();
  },

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`/api/admin/products?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Failed to delete product" }));
      throw new Error(error.error || "Failed to delete product");
    }
  },
};