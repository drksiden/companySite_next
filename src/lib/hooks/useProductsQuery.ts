// lib/hooks/useProductsQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  ProductFilters,
  ProductPagination,
  CreateProductData,
  UpdateProductData,
  ProductsResponse,
} from "@/lib/services/admin/product";
import { Product } from "@/types/catalog";
import { UploadInfo } from "@/lib/services/admin/product";

export function useProductsQuery(
  filters: ProductFilters = {},
  pagination: ProductPagination = { limit: 20, offset: 0 }
) {
  return useQuery({
    queryKey: ["products", filters, pagination],
    queryFn: async (): Promise<ProductsResponse> => {
      return await productService.listProducts(filters, pagination);
    },
    staleTime: 2 * 60 * 1000, // 2 минуты
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    Product & { uploadInfo?: UploadInfo },
    Error,
    CreateProductData,
    { previousQueries: Array<[any, any]> }
  >({
    mutationFn: productService.createProduct,
    onMutate: async (newProduct) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["products"] });
      
      // Сохраняем предыдущее значение для отката
      const previousQueries = queryClient.getQueriesData({ queryKey: ["products"] });
      
      return { previousQueries };
    },
    onError: (err, newProduct, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    Product & { uploadInfo?: UploadInfo },
    Error,
    UpdateProductData,
    { previousQueries: Array<[any, any]> }
  >({
    mutationFn: productService.updateProduct,
    onMutate: async (updatedProduct) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["products"] });
      
      // Сохраняем предыдущее значение для отката
      const previousQueries = queryClient.getQueriesData({ queryKey: ["products"] });
      
      // Оптимистично обновляем кэш (обновление будет видно после успешного ответа)
      // Не обновляем здесь, так как formData содержит FormData, а не объект Product
      
      return { previousQueries };
    },
    onError: (err, updatedProduct, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (data) => {
      // Обновляем кэш с реальными данными с сервера
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            products: old.products.map((p) =>
              p.id === data.id ? data : p
            ),
          };
        }
      );
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    string,
    { previousQueries: Array<[any, any]>; deletedProductId: string }
  >({
    mutationFn: productService.deleteProduct,
    onMutate: async (productId) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["products"] });
      
      // Сохраняем предыдущее значение для отката
      const previousQueries = queryClient.getQueriesData({ queryKey: ["products"] });
      
      // Оптимистично удаляем из кэша
      queryClient.setQueriesData<ProductsResponse>(
        { queryKey: ["products"] },
        (old) => {
          if (!old) return old;
          const deletedProduct = old.products.find((p) => p.id === productId);
          return {
            ...old,
            products: old.products.filter((p) => p.id !== productId),
            total: old.total - 1,
          };
        }
      );
      
      return { previousQueries, deletedProductId: productId };
    },
    onError: (err, productId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      // Инвалидируем запросы для обновления данных
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}