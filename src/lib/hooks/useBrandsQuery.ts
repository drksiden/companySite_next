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
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

// Удаление
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandService.deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
