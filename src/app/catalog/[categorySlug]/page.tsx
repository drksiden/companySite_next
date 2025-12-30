import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabaseServer";
import CatalogShell from "@/features/catalog/components/CatalogShell";
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { JsonLd } from '@/components/seo/JsonLd';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Функция для генерации изображения категории на основе slug
function getCategoryImageUrl(categorySlug: string, categoryName: string): string {
  // Маппинг slug категорий на цвета градиентов и иконки (SVG paths)
  const categoryConfig: Record<string, { 
    gradient: { from: string; to: string; via?: string };
    iconPath: string;
  }> = {
    'security-fire-alarms': { 
      gradient: { from: '#f97316', to: '#ea580c', via: '#fb923c' },
      iconPath: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'
    },
    'surveillance': { 
      gradient: { from: '#6366f1', to: '#4f46e5', via: '#818cf8' },
      iconPath: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
    },
    'network-equipment': { 
      gradient: { from: '#10b981', to: '#059669', via: '#34d399' },
      iconPath: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    'intercoms': { 
      gradient: { from: '#f59e0b', to: '#d97706', via: '#fbbf24' },
      iconPath: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
    },
    'power-supplies': { 
      gradient: { from: '#a855f7', to: '#9333ea', via: '#c084fc' },
      iconPath: 'M5 13l4 4L19 7'
    },
    'notification-systems': { 
      gradient: { from: '#ec4899', to: '#db2777', via: '#f472b6' },
      iconPath: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
    },
    'access-control': { 
      gradient: { from: '#6b7280', to: '#4b5563', via: '#9ca3af' },
      iconPath: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
    },
    'cable-management': { 
      gradient: { from: '#06b6d4', to: '#0891b2', via: '#22d3ee' },
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
    },
    'cables': { 
      gradient: { from: '#d946ef', to: '#c026d3', via: '#e879f9' },
      iconPath: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    'automation': { 
      gradient: { from: '#3b82f6', to: '#2563eb', via: '#60a5fa' },
      iconPath: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
    },
  };

  const config = categoryConfig[categorySlug] || { 
    gradient: { from: '#3b82f6', to: '#6366f1' },
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  const { gradient, iconPath } = config;

  // Создаем красивое SVG изображение с градиентом, иконкой и текстом
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
          ${gradient.via ? `<stop offset="50%" style="stop-color:${gradient.via};stop-opacity:1" />` : ''}
          <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      <rect width="1200" height="630" fill="url(#grad)"/>
      <g transform="translate(600, 250)">
        <circle cx="0" cy="0" r="80" fill="rgba(255,255,255,0.2)" filter="url(#shadow)"/>
        <path d="${iconPath}" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(-40, -40) scale(4)"/>
      </g>
      <text x="600" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle" filter="url(#shadow)">
        ${categoryName}
      </text>
      <text x="600" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">
        Азия NTB - Системы безопасности и автоматизации
      </text>
    </svg>
  `.trim().replace(/\s+/g, ' ');

  // Кодируем SVG в data URL
  const encodedSvg = encodeURIComponent(svg);
  return `data:image/svg+xml,${encodedSvg}`;
}

async function getCategoryBySlug(slug: string) {
  const supabase = await createServerClient();
  
  // Ищем категорию по slug (может быть как корневая, так и подкатегория)
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, description_html, meta_description, meta_title, meta_keywords, image_url, parent_id, level")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  // Если это подкатегория, получаем родительскую категорию
  let parentCategory = null;
  if (data.parent_id) {
    const { data: parent } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", data.parent_id)
      .eq("is_active", true)
      .maybeSingle();
    parentCategory = parent;
  }

  return { ...data, parentCategory };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  
  const category = await getCategoryBySlug(categorySlug);
  
  if (!category) {
    return {
      title: "Категория не найдена",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryPath = `/catalog/${categorySlug}`;
  
  // Получаем текущий хост из headers для правильного формирования URL
  const headersList = await headers();
  const host = headersList.get('host') || 'asia-ntb.kz';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentBaseUrl = `${protocol}://${host}`;
  
  const title = category.meta_title || category.name;
  const description = category.meta_description || category.description || 
    `${category.name}. Официальный дилер систем безопасности и автоматизации в Казахстане.`;
  const keywords = category.meta_keywords?.split(",").map((k: string) => k.trim()).filter(Boolean) || 
    [category.name, "каталог", "Казахстан"];

  // Генерируем изображение для категории, если его нет
  const categoryImage = category.image_url || getCategoryImageUrl(categorySlug, category.name);

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: categoryPath, // Относительный путь - Next.js автоматически добавит правильный домен через metadataBase
    },
    openGraph: {
      title: category.name,
      description,
      url: `${currentBaseUrl}${categoryPath}`, // Абсолютный URL с текущим хостом
      siteName: 'Азия NTB',
      type: 'website',
      locale: 'ru_RU',
      images: [
        {
          url: categoryImage,
          width: 1200,
          height: 630,
          alt: category.name,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description,
      images: [categoryImage],
    },
  };
}

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  
  const category = await getCategoryBySlug(categorySlug);
  
  if (!category) {
    notFound();
  }

  // Получаем ID категории для фильтрации
  const categoryId = category.id;
  
  // Обновляем searchParams чтобы включить category ID
  const updatedSearchParams = {
    ...resolvedSearchParams,
    category: categoryId,
  };

  // Строим breadcrumbs с учетом родительской категории
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
  ];
  
  // Если есть родительская категория, добавляем её в breadcrumbs
  if (category.parentCategory) {
    breadcrumbItems.push({
      name: category.parentCategory.name,
      url: `/catalog/${category.parentCategory.slug}`,
    });
  }
  
  breadcrumbItems.push({
    name: category.name,
    url: `/catalog/${categorySlug}`,
  });

  // Генерируем изображение для категории, если его нет
  const categoryImage = category.image_url || getCategoryImageUrl(categorySlug, category.name);

  // Получаем текущий хост из headers для правильного формирования URL в JSON-LD
  const headersList = await headers();
  const host = headersList.get('host') || 'asia-ntb.kz';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const currentBaseUrl = `${protocol}://${host}`;

  // Структурированные данные для категории (CollectionPage)
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.meta_description || category.description || `${category.name}. Официальный дилер систем безопасности и автоматизации в Казахстане.`,
    url: `${currentBaseUrl}/catalog/${categorySlug}`,
    image: categoryImage,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${currentBaseUrl}${item.url}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Главная
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog" className="text-muted-foreground hover:text-foreground">
                  Каталог
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {category.parentCategory && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/catalog/${category.parentCategory.slug}`} className="text-muted-foreground hover:text-foreground">
                      {category.parentCategory.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="min-h-screen bg-background">
        <CatalogShell searchParams={updatedSearchParams} />
      </div>
    </>
  );
}
