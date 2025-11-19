import { createServerClient } from "@/lib/supabaseServer";
import NewsArticleClient from "@/components/NewsArticleClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

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
  documents: string[] | null;
  is_active: boolean;
}

interface RelatedNewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  is_active: boolean;
}

interface NewsPageProps {
  params: Promise<{ id: string }>; // Update to reflect that params is a Promise
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
    .select(
      "id, title, description, content, date, category, images, tags, author, documents, is_active",
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Supabase fetch error for single article:", error);
    return null;
  }

  return data as NewsItem;
}

// 2. Функция получения похожих статей
async function fetchRelatedNews(
  currentArticle: NewsItem,
): Promise<RelatedNewsItem[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("news")
    .select("id, title, date, category, is_active")
    .eq("category", currentArticle.category)
    .eq("is_active", true)
    .neq("id", currentArticle.id)
    .order("date", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Supabase fetch error for related articles:", error);
    return [];
  }

  return (data as RelatedNewsItem[]) || [];
}

// 3. Генерация метаданных (SEO)
export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  const { id } = await params; // Await params to resolve the Promise
  const article = await fetchNewsArticle(id);

  if (!article) {
    return {
      title: "Новость не найдена",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Формируем абсолютный URL для Open Graph изображения
  const imageUrl =
    article.images && article.images.length > 0
      ? `${BASE_URL}${article.images[0]}`
      : undefined;

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags?.join(", ") || article.category,
    alternates: {
      canonical: `/news/${article.id}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${BASE_URL}/news/${article.id}`,
      siteName: 'Азия NTB',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
      type: "article",
      locale: "ru_RU",
      publishedTime: article.date,
      authors: article.author ? [article.author] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: article.title,
      description: article.description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const { id } = await params; // Await params to resolve the Promise
  const article = await fetchNewsArticle(id);

  if (!article) {
    notFound();
  }

  const relatedNews = await fetchRelatedNews(article);

  const articleUrl = `${BASE_URL}/news/${article.id}`;
  const articleImage = article.images && article.images.length > 0 
    ? `${BASE_URL}${article.images[0]}` 
    : undefined;

  // Breadcrumbs для JSON-LD
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Новости', url: '/news' },
    { name: article.title, url: `/news/${article.id}` },
  ];

  return (
    <>
      <ArticleJsonLd
        article={{
          headline: article.title,
          description: article.description,
          image: articleImage,
          datePublished: article.date,
          dateModified: article.date, // Можно добавить поле updated_at если есть
          author: article.author || undefined,
          url: articleUrl,
        }}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <NewsArticleClient article={article} relatedNews={relatedNews} />
    </>
  );
}
