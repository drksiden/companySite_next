import { Suspense } from 'react';
import { createServerClient } from "@/lib/supabaseServer";
import { NewsClient } from './NewsClient';
import { NewsLoadingFallback } from './NewsLoadingFallback'; 

interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string | null;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
  author: string | null;
  created_at: string;
  updated_at: string;
}

const NEWS_LIMIT = 4;
const FEATURED_LIMIT = 1;

async function fetchNews(): Promise<NewsItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, description, date, category, images")
    .order("date", { ascending: false })
    .limit(NEWS_LIMIT);

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return (data as unknown as NewsItem[]) || [];
}

export async function News() {
  
  const newsData = await fetchNews();
  
  const featuredNewsData = newsData.slice(0, FEATURED_LIMIT);
  const regularNewsData = newsData.slice(FEATURED_LIMIT, NEWS_LIMIT);
  
  const featuredNews = featuredNewsData.length > 0 ? featuredNewsData[0] : null;
  const regularNews = featuredNews ? regularNewsData : newsData.slice(0, 3);

  return (
    <Suspense fallback={<NewsLoadingFallback />}>
      <NewsClient 
        featuredNews={featuredNews} 
        regularNews={regularNews}
      />
    </Suspense>
  );
}