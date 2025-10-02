import { createServerClient } from "@/lib/supabaseServer";
import NewsArticleClient from "@/components/NewsArticleClient"; // Импорт Client Component
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Интерфейсы, соответствующие Supabase
interface NewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  category: string;
  images: string[] | null;
  tags: string[] | null;
  author: string | null;
}

interface RelatedNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
}

interface NewsPageProps {
  params: { id: string };
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  return "http://localhost:3000";
};

const BASE_URL = getBaseUrl();

// 1. Функция получения одной статьи
async function fetchNewsArticle(id: string): Promise<NewsItem | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, description, content, date, category, images, tags, author")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Supabase fetch error for single article:", error);
    return null;
  }

  return data as unknown as NewsItem;
}

// 2. Функция получения похожих статей
async function fetchRelatedNews(currentArticle: NewsItem): Promise<RelatedNewsItem[]> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from("news")
    .select("id, title, date, category")
    .eq("category", currentArticle.category)
    .neq("id", currentArticle.id)
    .order("date", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Supabase fetch error for related articles:", error);
    return [];
  }

  return (data as unknown as RelatedNewsItem[]) || [];
}

// 3. Генерация метаданных (SEO)
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
    const id = params.id;
    const article = await fetchNewsArticle(id);

    if (!article) {
        return {
            title: "Новость не найдена",
        };
    }
    
    // Формируем абсолютный URL для Open Graph изображения
    const imageUrl = (article.images && article.images.length > 0)
        ? `${BASE_URL}${article.images[0]}` // Предполагаем, что images[0] - это относительный путь: /images/...
        : undefined;

    return {
        title: article.title,
        description: article.description,
        keywords: article.tags?.join(", ") || article.category,
        
        // Open Graph для социальных сетей
        openGraph: {
            title: article.title,
            description: article.description,
            url: `${BASE_URL}/news/${article.id}`, // Используем абсолютный URL для страницы
            
            // Добавляем изображение с абсолютным URL и рекомендованными размерами
            images: imageUrl ? [{ 
                url: imageUrl, 
                width: 1200, 
                height: 630, 
                alt: article.title 
            }] : [],
            
            type: 'article',
            publishedTime: article.date,
            authors: article.author ? [article.author] : undefined,
        },
        
        // Twitter Card для лучшего отображения в Twitter/X
        twitter: {
            card: imageUrl ? 'summary_large_image' : 'summary',
            title: article.title,
            description: article.description,
            images: imageUrl ? [imageUrl] : [],
        }
    };
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const id = params.id;
  
  const article = await fetchNewsArticle(id);

  if (!article) {
    notFound();
  }
  
  const relatedNews = await fetchRelatedNews(article);

  return (
    <NewsArticleClient
      article={article}
      relatedNews={relatedNews}
    />
  );
}