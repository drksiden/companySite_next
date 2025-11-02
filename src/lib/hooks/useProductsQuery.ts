// lib/hooks/useProductsQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  ProductFilters,
  ProductPagination,
  CreateProductData,
  UpdateProductData,
} from "@/lib/services/admin/product";
import { Product } from "@/types/catalog";
import { UploadInfo } from "@/lib/services/admin/product";

export function useProductsQuery(
  filters: ProductFilters = {},
  pagination: ProductPagination = { limit: 20, offset: 0 }
) {
  return useQuery({
    queryKey: ["products", filters, pagination],
    queryFn: () => productService.listProducts(filters, pagination),
    keepPreviousData: true, // для плавной пагинации
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    Product & { uploadInfo?: UploadInfo },
    Error,
    CreateProductData
  >({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    Product & { uploadInfo?: UploadInfo },
    Error,
    UpdateProductData
  >({
    mutationFn: productService.updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: productService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}