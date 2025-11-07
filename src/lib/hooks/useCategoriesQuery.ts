// lib/hooks/useCategoriesQuery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/lib/services/admin/category";
import { Category, CategoryFormData } from "@/types/catalog";

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.listCategories(),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      // Инвалидация в фоне, не блокируя завершение мутации
      // Используем refetchType: 'active' чтобы обновить только активные запросы
      qc.invalidateQueries({ 
        queryKey: ["categories"],
        refetchType: 'active'
      }).then(() => {
        console.log("Categories cache invalidated after create");
      }).catch((err) => {
        console.error("Error invalidating cache:", err);
      });
    },
    onError: (error) => {
      console.error("Error creating category:", error);
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      // Инвалидация в фоне, не блокируя завершение мутации
      // Используем refetchType: 'active' чтобы обновить только активные запросы
      qc.invalidateQueries({ 
        queryKey: ["categories"],
        refetchType: 'active'
      }).then(() => {
        console.log("Categories cache invalidated after update");
      }).catch((err) => {
        console.error("Error invalidating cache:", err);
      });
    },
    onError: (error) => {
      console.error("Error updating category:", error);
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useToggleActiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.toggleActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
