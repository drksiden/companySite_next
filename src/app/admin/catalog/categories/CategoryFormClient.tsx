"use client";

import { useState } from "react";
import { Category, CategoryFormData } from "@/types/catalog";
import { useCategoriesQuery, useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleActiveCategory } from "@/lib/hooks/useCategoriesQuery";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { CategoryList } from "@/components/admin/CategoryList";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/enhanced-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type FormMode = "create" | "edit" | "createSub";

export default function CategoryFormClient() {
  const { data: categories = [], isLoading, error } = useCategoriesQuery();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const deleteMut = useDeleteCategory();
  const toggleActiveMut = useToggleActiveCategory();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formKey, setFormKey] = useState(0); // Ключ для принудительного пересоздания формы
  const [isFormSubmitting, setIsFormSubmitting] = useState(false); // Локальное состояние для отслеживания отправки формы

  const handleOpenForm = (mode: FormMode, category?: Category) => {
    // Сбрасываем состояние мутаций перед открытием формы, чтобы избежать бесконечной загрузки
    createMut.reset();
    updateMut.reset();
    
    console.log("Opening form:", {
      mode,
      categoryId: category?.id,
      createPending: createMut.isPending,
      updatePending: updateMut.isPending,
      createStatus: createMut.status,
      updateStatus: updateMut.status,
    });
    
    setFormMode(mode);
    setSelectedCategory(category || null);
    setFormKey(prev => prev + 1); // Увеличиваем ключ для пересоздания формы
    setShowForm(true);
  };

  const handleCloseForm = () => {
    // Сбрасываем состояние мутаций при закрытии формы
    createMut.reset();
    updateMut.reset();
    setIsFormSubmitting(false); // Сбрасываем локальное состояние отправки
    
    setShowForm(false);
    setFormMode("create"); // Сбрасываем режим формы на создание
    setSelectedCategory(null);
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const result = await createMut.mutateAsync(data);
      // Инвалидация уже происходит в onSuccess мутации, не нужно делать дважды
      toast.success("Категория успешно создана");
      return result; // Возвращаем результат для логирования
    } catch (error) {
      // Ошибка уже обработана в handleSubmit, но перебросим её дальше
      throw error;
    }
  };
  const handleEditCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) {
      throw new Error("Категория для редактирования не выбрана");
    }
    try {
      const result = await updateMut.mutateAsync({ id: selectedCategory.id, data });
      // Инвалидация уже происходит в onSuccess мутации, не нужно делать дважды
      toast.success("Категория успешно обновлена");
      return result; // Возвращаем результат для логирования
    } catch (error) {
      // Ошибка уже обработана в handleSubmit, но перебросим её дальше
      throw error;
    }
  };
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    await deleteMut.mutateAsync(selectedCategory.id);
    toast.success("Категория успешно удалена");
    setShowDeleteDialog(false);
  };
  const handleToggleActive = async (category: Category, isActive: boolean) => {
    await toggleActiveMut.mutateAsync({ id: category.id, isActive });
    toast.success(isActive ? "Категория активирована" : "Категория деактивирована");
  };

  const handleSubmit = async (data: CategoryFormData) => {
    // Предотвращаем повторную отправку
    if (isFormSubmitting || createMut.isPending || updateMut.isPending) {
      console.warn("Form already submitting, skipping submit");
      return;
    }

    setIsFormSubmitting(true);

    try {
      console.log("Submitting category form:", { formMode, data, selectedCategoryId: selectedCategory?.id });
      
      let result;
      switch (formMode) {
        case "create": 
          result = await handleCreateCategory(data); 
          break;
        case "edit": 
          result = await handleEditCategory(data); 
          break;
        case "createSub": 
          result = await handleCreateCategory({ ...data, parent_id: selectedCategory?.id }); 
          break;
        default:
          throw new Error("Неизвестный режим формы");
      }
      
      console.log("Category submission successful:", result);
      
      // Небольшая задержка для завершения всех операций
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Проверяем статус мутаций перед закрытием
      console.log("Mutations status before close:", {
        createPending: createMut.isPending,
        updatePending: updateMut.isPending,
        createStatus: createMut.status,
        updateStatus: updateMut.status,
      });
      
      // Если мутации все еще в процессе, принудительно сбрасываем их
      if (createMut.isPending || updateMut.isPending) {
        console.warn("Mutations still pending, forcing reset");
        createMut.reset();
        updateMut.reset();
      }
      
      setIsFormSubmitting(false);
      
      // Мутация завершена, закрываем форму
      // Инвалидация кэша происходит в фоне и не должна блокировать закрытие формы
      handleCloseForm();
    } catch (error: any) {
      console.error("Error submitting category:", error);
      
      setIsFormSubmitting(false);
      
      // Детальная обработка ошибок
      let errorMessage = "Произошла ошибка при сохранении категории";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        errorMessage = `Ошибка ${error.code}: ${error.message || "Неизвестная ошибка"}`;
      }
      
      // Показываем ошибку пользователю
      toast.error(errorMessage);
      
      // Сбрасываем состояние мутаций при ошибке, чтобы не было бесконечной загрузки
      createMut.reset();
      updateMut.reset();
      
      // Не закрываем форму при ошибке, чтобы пользователь мог исправить
    }
  };

  const getInitialFormData = (): CategoryFormData | undefined => {
    if (formMode === "edit" && selectedCategory) {
      return {
        name: selectedCategory.name || "",
        slug: selectedCategory.slug || "",
        description: selectedCategory.description || "",
        parent_id: selectedCategory.parent_id,
        image_url: selectedCategory.image_url || "",
        icon_name: selectedCategory.icon_name || "",
        is_active: selectedCategory.is_active ?? true,
        sort_order: selectedCategory.sort_order || 0,
        meta_title: selectedCategory.meta_title || "",
        meta_description: selectedCategory.meta_description || "",
        meta_keywords: selectedCategory.meta_keywords || "",
      };
    } else if (formMode === "createSub" && selectedCategory) {
      return {
        name: "",
        slug: "",
        description: "",
        parent_id: selectedCategory.id,
        image_url: "",
        icon_name: "none",
        is_active: true,
        sort_order: 0,
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      };
    }
    // Для режима "create" возвращаем undefined, чтобы форма сбросилась
    return undefined;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => handleOpenForm("create")}>
          <Plus className="mr-2 h-4 w-4" />
          Создать категорию
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Загрузка категорий...
        </div>
      ) : error ? (
        <div className="text-destructive text-center">Ошибка загрузки</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="category-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <CategoryList
              categories={categories}
              onEdit={cat => handleOpenForm("edit", cat)}
              onDelete={cat => { setSelectedCategory(cat); setShowDeleteDialog(true); }}
              onAddSubcategory={cat => handleOpenForm("createSub", cat)}
              onToggleActive={handleToggleActive}
              loadingToggledCategoryId={toggleActiveMut.isPending ? selectedCategory?.id : null}
            />
          </motion.div>
        </AnimatePresence>
      )}
      {/* Остальные модальные окна как раньше */}
      <Dialog 
        open={showForm} 
        onOpenChange={(open) => {
          if (!open) {
            handleCloseForm(); // Используем нашу функцию для правильного сброса
          } else {
            setShowForm(true);
          }
        }}
      >
        <DialogContent size="lg" scrollable>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Создать категорию"
              : formMode === "edit" ? "Редактировать категорию"
              : `Создать подкатегорию для "${selectedCategory?.name}"`}
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о категории. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            key={`${formMode}-${selectedCategory?.id || "new"}-${formKey}`} // Пересоздаем форму при изменении режима/категории/открытии
            onSubmit={handleSubmit}
            initialData={getInitialFormData()}
            categories={categories}
            currentCategoryId={selectedCategory?.id}
            isSubmitting={isFormSubmitting || createMut.isPending || updateMut.isPending}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Категория "{selectedCategory?.name}" будет удалена.
              {(selectedCategory?.children?.length ?? 0) > 0 && (
                <span className="text-destructive font-semibold block mt-2">
                  Внимание: Эта категория содержит подкатегории, которые также будут удалены!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
