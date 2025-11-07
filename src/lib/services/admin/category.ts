import { createClient } from "@/lib/supabaseClient";
import { Category, CategoryFormData } from "@/types/catalog";
import { toast } from "sonner";

// Получаем клиент, который автоматически использует актуальную сессию
function getSupabaseClient() {
  return createClient();
}

export const categoryService = {
  async listCategories(): Promise<Category[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async createCategory(data: CategoryFormData): Promise<Category> {
    // Валидация обязательных полей
    if (!data.name || data.name.trim() === "") {
      throw new Error("Название категории обязательно");
    }

    // Генерируем slug если его нет
    let slug = data.slug || "";
    if (!slug || slug.trim() === "") {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё\s-]/gi, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    let level = 0;
    let path = "";

    if (data.parent_id) {
      // Get the parent category to determine level and path
      const supabase = getSupabaseClient();
      const { data: parentData, error: parentError } = await supabase
        .from("categories")
        .select("level, path")
        .eq("id", data.parent_id)
        .single();

      if (parentError) {
        console.error("Error fetching parent category:", parentError);
        toast.error(
          `Ошибка при получении родительской категории: ${parentError.message}`,
        );
        throw new Error(`Ошибка при получении родительской категории: ${parentError.message}`);
      }

      if (!parentData) {
        throw new Error("Родительская категория не найдена");
      }

      level = (parentData.level || 0) + 1;
      path = parentData.path ? `${parentData.path}/${slug}` : slug;
    } else {
      path = slug;
      level = 0;
    }

    // Подготавливаем данные для вставки с level и path
    const insertData: any = {
      ...data,
      slug,
      level,
      path,
    };

    const supabase = getSupabaseClient();
    const { data: result, error } = await supabase
      .from("categories")
      .insert([insertData])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating category:", error);
      toast.error(`Ошибка при создании категории: ${error.message}`);
      throw error;
    }
    
    return result;
  },
  async updateCategory(id: string, data: CategoryFormData): Promise<Category> {
    // Валидация обязательных полей
    if (!id) {
      throw new Error("ID категории обязателен");
    }

    console.log("Updating category:", { id, data });

    const supabase = getSupabaseClient();

    // Получаем текущую категорию для сравнения
    const { data: currentCategory, error: fetchError } = await supabase
      .from("categories")
      .select("parent_id, slug, level, path")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching current category:", fetchError);
      throw new Error(`Ошибка при получении категории: ${fetchError.message}`);
    }

    if (!currentCategory) {
      throw new Error("Категория не найдена");
    }

    // Проверяем, не пытается ли категория стать родителем самой себя
    if (data.parent_id === id) {
      throw new Error("Категория не может быть родителем самой себя");
    }

    // Проверяем, не пытается ли категория стать дочерней для своих потомков
    if (data.parent_id && currentCategory.path) {
      // Получаем все потомки текущей категории
      const { data: descendants, error: descendantsError } = await supabase
        .from("categories")
        .select("id")
        .like("path", `${currentCategory.path}/%`);

      if (descendantsError) {
        console.warn("Error checking descendants (non-critical):", descendantsError);
        // Не блокируем обновление, если проверка потомков не удалась
      } else if (descendants?.some((desc: any) => desc.id === data.parent_id)) {
        throw new Error("Категория не может быть дочерней для своих потомков");
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    // Пересчитываем level и path только если parent_id действительно изменился
    const parentIdChanged = data.parent_id !== currentCategory.parent_id;
    
    if (parentIdChanged) {
      if (data.parent_id) {
        const { data: parentData, error: parentError } = await supabase
          .from("categories")
          .select("level, path")
          .eq("id", data.parent_id)
          .single();

        if (parentError) {
          console.error("Error fetching parent category:", parentError);
          throw new Error(`Ошибка при получении родительской категории: ${parentError.message}`);
        }

        if (!parentData) {
          throw new Error("Родительская категория не найдена");
        }

        const slug = data.slug || currentCategory.slug || "";
        updateData.level = (parentData.level || 0) + 1;
        updateData.path = parentData.path ? `${parentData.path}/${slug}` : slug;
      } else {
        // Убираем родителя - категория становится корневой
        const slug = data.slug || currentCategory.slug || "";
        updateData.level = 0;
        updateData.path = slug;
      }
    } else if (data.slug && data.slug !== currentCategory.slug) {
      // Если изменился slug, но parent_id не изменился, обновляем только path
      if (currentCategory.parent_id) {
        const { data: parentData } = await supabase
          .from("categories")
          .select("path")
          .eq("id", currentCategory.parent_id)
          .single();

        if (parentData) {
          updateData.path = parentData.path ? `${parentData.path}/${data.slug}` : data.slug;
        } else {
          updateData.path = data.slug;
        }
      } else {
        updateData.path = data.slug;
      }
    }

    console.log("Updating with data:", updateData);

    const { data: result, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating category:", error);
      toast.error(`Ошибка при обновлении категории: ${error.message}`);
      throw error;
    }
    
    console.log("Category updated successfully:", result);
    return result;
  },
  async deleteCategory(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
  async toggleActive(id: string, isActive: boolean): Promise<Category> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};