import { Suspense } from 'react';
import { Metadata } from 'next';
import { createServerClient } from "@/lib/supabaseServer";
import { NewsPageClient } from "@/components/NewsPageClient";
import { NewsLoadingFallback } from "@/components/NewsLoadingFallback";
import { COMPANY_NAME_SHORT } from "@/data/constants";

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  title: 'Новости',
  description: 'Актуальные новости и события компании Азия NTB. Обновления продукции, события отрасли, технические статьи и полезная информация о системах безопасности и автоматизации.',
  keywords: [
    'новости',
    'события',
    'обновления',
    'системы безопасности',
    'автоматизация',
    COMPANY_NAME_SHORT,
  ],
  alternates: {
    canonical: '/news',
  },
  openGraph: {
    title: `Новости - ${COMPANY_NAME_SHORT}`,
    description: 'Актуальные новости и события компании. Обновления продукции, события отрасли, технические статьи.',
    url: '/news',
    siteName: COMPANY_NAME_SHORT,
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Новости - ${COMPANY_NAME_SHORT}`,
    description: 'Актуальные новости и события компании.',
  },
};

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
    return (
        <Suspense fallback={<NewsLoadingFallback />}>
            <NewsPageContent />
        </Suspense>
    );
}

async function NewsPageContent() {
    const initialNews = await fetchAllNews();
    const categories = await fetchCategories(initialNews);
    
    return (
        <NewsPageClient
            initialNews={initialNews}
            categories={categories}
        />
    );
}