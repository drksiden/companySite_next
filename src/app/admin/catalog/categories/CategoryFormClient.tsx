"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Category, CategoryFormData } from '@/types/catalog';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { CategoryList } from '@/components/admin/CategoryList';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Props interface
interface CategoryFormClientProps {
  categories: Category[];
}

type FormMode = 'create' | 'edit' | 'createSub';

export default function CategoryFormClient({ categories: initialCategories }: CategoryFormClientProps) {
  // State for categories data
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  
  // UI state
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState<string | null>(null);

  const handleOpenForm = (mode: FormMode, category?: Category) => {
    setFormMode(mode);
    setSelectedCategory(category || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCategory(null);
  };

  const getFormTitle = () => {
    switch (formMode) {
      case 'create':
        return 'Создать категорию';
      case 'edit':
        return 'Редактировать категорию';
      case 'createSub':
        return `Создать подкатегорию для "${selectedCategory?.name}"`;
      default:
        return 'Категория';
    }
  };

  const handleCreateCategory = async (data: CategoryFormData) => {
    setIsCreating(true);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Calculate the level based on parent_id
      let level = 0;
      let path = '';
      
      if (data.parent_id) {
        // Get the parent category to determine level and path
        const { data: parentData, error: parentError } = await supabase
          .from('categories')
          .select('level, path')
          .eq('id', data.parent_id)
          .single();
        
        if (parentError) {
          console.error('Error fetching parent category:', parentError);
          toast.error(`Ошибка при получении родительской категории: ${parentError.message}`);
          return;
        }
        
        level = (parentData.level || 0) + 1;
        path = parentData.path ? `${parentData.path}/${data.slug}` : data.slug;
      } else {
        path = data.slug;
      }
      
      // Create the category
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert([
          {
            ...data,
            level,
            path,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        toast.error(`Ошибка при создании категории: ${error.message}`);
      } else {
        console.log('Category created successfully:', newCategory);
        
        // Update the local state with the new category
        setCategories(prevCategories => [...prevCategories, newCategory]);
        
        // Show success toast
        toast.success('Категория успешно создана');
      }
    } catch (error) {
      console.error('Error in create operation:', error);
      toast.error('Произошла ошибка при создании категории');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = async (data: CategoryFormData) => {
    if (!selectedCategory) return;
    
    setIsEditing(true);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Check if the parent_id has changed
      let level = selectedCategory.level;
      let path = selectedCategory.path;
      
      if (data.parent_id !== selectedCategory.parent_id) {
        // Recalculate level and path if parent has changed
        if (data.parent_id) {
          // Get the parent category to determine level and path
          const { data: parentData, error: parentError } = await supabase
            .from('categories')
            .select('level, path')
            .eq('id', data.parent_id)
            .single();
          
          if (parentError) {
            console.error('Error fetching parent category:', parentError);
            toast.error(`Ошибка при получении родительской категории: ${parentError.message}`);
            return;
          }
          
          level = (parentData.level || 0) + 1;
          path = parentData.path ? `${parentData.path}/${data.slug}` : data.slug;
        } else {
          // If no parent, it's a root category
          level = 0;
          path = data.slug;
        }
      } else if (data.slug !== selectedCategory.slug) {
        // If only the slug changed, update the path
        if (selectedCategory.parent_id) {
          // Get the parent's path
          const { data: parentData, error: parentError } = await supabase
            .from('categories')
            .select('path')
            .eq('id', selectedCategory.parent_id)
            .single();
          
          if (parentError) {
            console.error('Error fetching parent category:', parentError);
            toast.error(`Ошибка при получении родительской категории: ${parentError.message}`);
            return;
          }
          
          path = parentData.path ? `${parentData.path}/${data.slug}` : data.slug;
        } else {
          path = data.slug;
        }
      }
      
      // Update the category
      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          ...data,
          level,
          path,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCategory.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating category:', error);
        toast.error(`Ошибка при обновлении категории: ${error.message}`);
      } else {
        console.log('Category updated successfully:', updatedCategory);
        
        // Update the local state with the updated category
        setCategories(prevCategories =>
          prevCategories.map(category =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
        );
        
        // Show success toast
        toast.success('Категория успешно обновлена');
      }
    } catch (error) {
      console.error('Error in update operation:', error);
      toast.error('Произошла ошибка при обновлении категории');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    setIsDeleting(true);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);
      
      if (error) {
        console.error('Error deleting category:', error);
        toast.error(`Ошибка при удалении категории: ${error.message}`);
      } else {
        console.log('Category deleted successfully:', selectedCategory.id);
        
        // Update the local state by removing the deleted category
        setCategories(prevCategories =>
          prevCategories.filter(category => category.id !== selectedCategory.id)
        );
        
        // Show success toast
        toast.success('Категория успешно удалена');
      }
    } catch (error) {
      console.error('Error in delete operation:', error);
      toast.error('Произошла ошибка при удалении категории');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleActive = async (category: Category, isActive: boolean) => {
    setIsTogglingActive(category.id);
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Update the is_active status
      const { data: updatedCategory, error } = await supabase
        .from('categories')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error toggling category active state:', error);
        toast.error(`Ошибка при изменении статуса категории: ${error.message}`);
      } else {
        console.log('Category active state updated successfully:', updatedCategory);
        
        // Update the local state with the updated category
        setCategories(prevCategories =>
          prevCategories.map(cat =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
        
        // Show success toast
        toast.success(`Категория ${isActive ? 'активирована' : 'деактивирована'}`);
      }
    } catch (error) {
      console.error('Error in toggle active operation:', error);
      toast.error('Произошла ошибка при изменении статуса категории');
    } finally {
      setIsTogglingActive(null);
    }
  };

  const handleSubmit = (data: CategoryFormData) => {
    switch (formMode) {
      case 'create':
        handleCreateCategory(data);
        break;
      case 'edit':
        handleEditCategory(data);
        break;
      case 'createSub':
        handleCreateCategory({
          ...data,
          parent_id: selectedCategory?.id
        });
        break;
    }
    
    handleCloseForm();
  };

  // Create initial form data for edit mode
  const getInitialFormData = (): CategoryFormData | undefined => {
    if (formMode === 'edit' && selectedCategory) {
      return {
        name: selectedCategory.name || '',
        slug: selectedCategory.slug || '',
        description: selectedCategory.description || '',
        parent_id: selectedCategory.parent_id,
        image_url: selectedCategory.image_url || '',
        icon_name: selectedCategory.icon_name || '',
        is_active: selectedCategory.is_active || true,
        sort_order: selectedCategory.sort_order || 0,
        meta_title: selectedCategory.meta_title || '',
        meta_description: selectedCategory.meta_description || '',
        meta_keywords: selectedCategory.meta_keywords || '',
      };
    } else if (formMode === 'createSub' && selectedCategory) {
      return {
        name: '',
        slug: '',
        description: '',
        parent_id: selectedCategory.id,
        image_url: '',
        icon_name: '',
        is_active: true,
        sort_order: 0,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
      };
    }
    
    return undefined;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Категории</h1>
        <Button onClick={() => handleOpenForm('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Создать категорию
        </Button>
      </div>
      
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
            onEdit={(category: Category) => handleOpenForm('edit', category)}
            onDelete={(category: Category) => {
              setSelectedCategory(category);
              setShowDeleteDialog(true);
            }}
            onAddSubcategory={(category: Category) => handleOpenForm('createSub', category)}
            onToggleActive={handleToggleActive}
            loadingToggledCategoryId={isTogglingActive}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Category Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{getFormTitle()}</DialogTitle>
            <DialogDescription>
              Заполните информацию о категории. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          
          <CategoryForm
            onSubmit={handleSubmit}
            initialData={getInitialFormData()}
            categories={categories}
            currentCategoryId={formMode === 'edit' ? selectedCategory?.id : undefined}
          />
          
          {(isCreating || isEditing) && (
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {formMode === 'create' || formMode === 'createSub' ? 'Создание...' : 'Сохранение...'}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Категория "{selectedCategory?.name}" будет удалена.
              {selectedCategory?.children && selectedCategory.children.length > 0 && (
                <span className="text-destructive font-semibold block mt-2">
                  Внимание: Эта категория содержит подкатегории, которые также будут удалены!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}