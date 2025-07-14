import { Category } from '@/types/catalog';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CategoryList } from '@/components/admin/CategoryList';

async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store.getAll()
        },
      },
    }
  )
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function CategoriesServerPage() {
  const categories = await getCategories();

  return (
    <CategoryList categories={categories} />
  );
}