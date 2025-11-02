import { createBrowserClient } from "@supabase/ssr";
import { Category, CategoryFormData } from "@/types/catalog";
import { toast } from "sonner";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const categoryService = {
  async listCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async createCategory(data: CategoryFormData): Promise<Category> {
    let level = 0;
      let path = "";

      if (data.parent_id) {
        // Get the parent category to determine level and path
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
        }

        if (!parentData) {
        throw new Error("Родительская категория не найдена");
        }

        level = (parentData.level || 0) + 1;
        path = parentData.path ? `${parentData.path}/${data.slug}` : data.slug;
      } else {
        path = data.slug;
      }
    const { data: result, error } = await supabase
      .from("categories")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  },
  async updateCategory(id: string, data: CategoryFormData): Promise<Category> {
    const { data: result, error } = await supabase
      .from("categories")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
  async toggleActive(id: string, isActive: boolean): Promise<Category> {
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