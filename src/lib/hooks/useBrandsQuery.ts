import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brandService, Brand } from "@/lib/services/admin/brand";

// Список брендов (автоматический кеш!! с timeout 2 минуты)
export function useBrandsQuery() {
  return useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: () => brandService.listBrands(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Получить бренд по id
export function useBrandQuery(id: string) {
  return useQuery<Brand | null>({
    queryKey: ["brand", id],
    queryFn: () => brandService.getBrand(id),
    enabled: !!id,
  });
}

// Создание бренда
export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandService.createBrand,
    onMutate: async (newBrand) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["brands"] });
      
      // Сохраняем предыдущее значение для отката
      const previousBrands = queryClient.getQueryData<Brand[]>(["brands"]);
      
      return { previousBrands };
    },
    onError: (err, newBrand, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousBrands) {
        queryClient.setQueryData(["brands"], context.previousBrands);
      }
    },
    onSuccess: (data) => {
      // Оптимистично добавляем новый бренд в кэш
      queryClient.setQueryData<Brand[]>(["brands"], (old = []) => [data, ...old]);
      
      // Инвалидируем для синхронизации
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

// Обновление
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, brand }: { id: string, brand: Partial<Brand> }) =>
      brandService.updateBrand(id, brand),
    onMutate: async ({ id, brand }) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["brands"] });
      
      // Сохраняем предыдущее значение для отката
      const previousBrands = queryClient.getQueryData<Brand[]>(["brands"]);
      
      // Оптимистично обновляем кэш
      queryClient.setQueryData<Brand[]>(["brands"], (old = []) =>
        old.map((b) => (b.id === id ? { ...b, ...brand } : b))
      );
      
      return { previousBrands };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousBrands) {
        queryClient.setQueryData(["brands"], context.previousBrands);
      }
    },
    onSuccess: (data) => {
      // Обновляем кэш с реальными данными с сервера
      queryClient.setQueryData<Brand[]>(["brands"], (old = []) =>
        old.map((b) => (b.id === data.id ? data : b))
      );
    },
  });
}

// Удаление
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandService.deleteBrand,
    onMutate: async (brandId) => {
      // Отменяем исходящие запросы
      await queryClient.cancelQueries({ queryKey: ["brands"] });
      
      // Сохраняем предыдущее значение для отката
      const previousBrands = queryClient.getQueryData<Brand[]>(["brands"]);
      
      // Оптимистично удаляем из кэша
      queryClient.setQueryData<Brand[]>(["brands"], (old = []) =>
        old.filter((b) => b.id !== brandId)
      );
      
      return { previousBrands };
    },
    onError: (err, brandId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousBrands) {
        queryClient.setQueryData(["brands"], context.previousBrands);
      }
    },
    onSuccess: () => {
      // Инвалидируем для синхронизации
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
