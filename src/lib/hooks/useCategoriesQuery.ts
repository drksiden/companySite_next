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
    onMutate: async (newCategory) => {
      // Отменяем исходящие запросы
      await qc.cancelQueries({ queryKey: ["categories"] });
      
      // Сохраняем предыдущее значение для отката
      const previousCategories = qc.getQueryData<Category[]>(["categories"]);
      
      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCategories) {
        qc.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSuccess: (data) => {
      // Оптимистично добавляем новую категорию в кэш
      qc.setQueryData<Category[]>(["categories"], (old = []) => [data, ...old]);
      
      // Инвалидируем для синхронизации
      qc.invalidateQueries({ 
        queryKey: ["categories"],
        refetchType: 'active'
      });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormData }) =>
      categoryService.updateCategory(id, data),
    onMutate: async ({ id, data }) => {
      // Отменяем исходящие запросы
      await qc.cancelQueries({ queryKey: ["categories"] });
      
      // Сохраняем предыдущее значение для отката
      const previousCategories = qc.getQueryData<Category[]>(["categories"]);
      
      // Оптимистично обновляем кэш
      qc.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
      );
      
      return { previousCategories };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCategories) {
        qc.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSuccess: (data) => {
      // Обновляем кэш с реальными данными с сервера
      qc.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === data.id ? data : cat))
      );
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onMutate: async (categoryId) => {
      // Отменяем исходящие запросы
      await qc.cancelQueries({ queryKey: ["categories"] });
      
      // Сохраняем предыдущее значение для отката
      const previousCategories = qc.getQueryData<Category[]>(["categories"]);
      
      // Оптимистично удаляем из кэша
      qc.setQueryData<Category[]>(["categories"], (old = []) =>
        old.filter((cat) => cat.id !== categoryId)
      );
      
      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCategories) {
        qc.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSuccess: () => {
      // Инвалидируем для синхронизации
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useToggleActiveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      categoryService.toggleActive(id, isActive),
    onMutate: async ({ id, isActive }) => {
      // Отменяем исходящие запросы
      await qc.cancelQueries({ queryKey: ["categories"] });
      
      // Сохраняем предыдущее значение для отката
      const previousCategories = qc.getQueryData<Category[]>(["categories"]);
      
      // Оптимистично обновляем статус
      qc.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === id ? { ...cat, is_active: isActive } : cat))
      );
      
      return { previousCategories };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения при ошибке
      if (context?.previousCategories) {
        qc.setQueryData(["categories"], context.previousCategories);
      }
    },
    onSuccess: (data) => {
      // Обновляем кэш с реальными данными с сервера
      qc.setQueryData<Category[]>(["categories"], (old = []) =>
        old.map((cat) => (cat.id === data.id ? data : cat))
      );
    },
  });
}
