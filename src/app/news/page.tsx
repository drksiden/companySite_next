import { Suspense } from 'react';
import { createServerClient } from "@/lib/supabaseServer";
import { NewsPageClient } from "@/components/NewsPageClient";
import { NewsLoadingFallback } from "@/components/NewsLoadingFallback";

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
  is_active: boolean;
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, description, date, category, images, tags, is_active")
    .eq("is_active", true)
    .order("date", { ascending: false });

  if (error) {
    console.error("Supabase fetch error for news list:", error);
    return [];
  }

  return (data as unknown as NewsItem[]) || [];
}

async function fetchCategories(newsData: NewsItem[]): Promise<string[]> {
    
    const uniqueCategories = new Set<string>();
    newsData.forEach(item => uniqueCategories.add(item.category));
    
    return ["Все", ...Array.from(uniqueCategories).sort()];
}

export default async function NewsPage() {
    
    const initialNews = await fetchAllNews();
    const categories = await fetchCategories(initialNews);
    
    return (
        <Suspense fallback={<NewsLoadingFallback />}>
            <NewsPageClient
                initialNews={initialNews}
                categories={categories}
            />
        </Suspense>
    );
}