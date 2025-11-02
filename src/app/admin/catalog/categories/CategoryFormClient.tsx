"use client";

import { useState } from "react";
import { Category, CategoryFormData } from "@/types/catalog";
import { useCategoriesQuery, useCreateCategory, useUpdateCategory, useDeleteCategory, useToggleActiveCategory } from "@/lib/hooks/useCategoriesQuery";
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

  const handleOpenForm = (mode: FormMode, category?: Category) => {
    setFormMode(mode);
    setSelectedCategory(category || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCategory(null);
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    await createMut.mutateAsync(data);
    toast.success("Категория успешно создана");
  };
  const handleEditCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    await updateMut.mutateAsync({ id: selectedCategory.id, data });
    toast.success("Категория успешно обновлена");
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

  const handleSubmit = (data: CategoryFormData) => {
    switch (formMode) {
      case "create": handleCreateCategory(data); break;
      case "edit": handleEditCategory(data); break;
      case "createSub": handleCreateCategory({ ...data, parent_id: selectedCategory?.id }); break;
    }
    handleCloseForm();
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
      is_active: selectedCategory.is_active || true,
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
      icon_name: "",
      is_active: true,
      sort_order: 0,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
    };
  }

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
      <Dialog open={showForm} onOpenChange={setShowForm}>
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
            onSubmit={handleSubmit}
            initialData={getInitialFormData()}
            categories={categories}
            currentCategoryId={selectedCategory?.id}
          />
          {(createMut.isPending || updateMut.isPending) && (
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {formMode === "create" || formMode === "createSub"
                ? "Создание..."
                : "Сохранение..."}
            </div>
          )}
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
