import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabaseServer";
import { CategoryProductsClient } from "@/components/catalog/CategoryProductsClient";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { LayoutGrid } from "lucide-react";
import { COMPANY_NAME_SHORT } from "@/data/constants";
import { CategoryDescription } from "@/components/catalog/CategoryDescription";
import type { CatalogProduct } from "@/lib/services/catalog";

interface CategoryPageProps {
  params: Promise<{ slugs: string[] }>;
}

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  level: number;
  description?: string | null;
  description_html?: string | null;
  image_url?: string | null;
  is_active: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
};

// Используем тип Product из types/supabase для совместимости с ProductCardList

export const revalidate = 3600;

// Корректная строгая проверка slug -> parent_id для цепочки любой глубины
async function resolveCategoryChain(slugs: string[], supabase: any) {
  let parentId: string | null = null;
  let category: Category | null = null;
  const chain: Category[] = [];
  
  for (let idx = 0; idx < slugs.length; idx++) {
    const slug = slugs[idx];
    let query = supabase
      .from("categories")
      .select("id, name, slug, parent_id, level, description, description_html, image_url, is_active, meta_title, meta_description, meta_keywords")
      .eq("slug", slug)
      .eq("is_active", true);

    if (idx === 0) {
      // Для первого slug — ищем level = 0 (корневые)
      query = query.eq("level", 0).is("parent_id", null);
    } else {
      // Для всех остальных — ищем, чтобы parent совпадал с прошлым id
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error) {
      console.error(`Error fetching category "${slug}":`, error.message);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    chain.push(data as Category);
    category = data as Category;
    parentId = data.id;
  }
  
  return { category, chain };
}

async function getChildCategories(parentId: string, supabase: any) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("parent_id", parentId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching child categories:", error.message);
    return [];
  }
  return data || [];
}

async function getProducts(categoryId: string, supabase: any): Promise<CatalogProduct[]> {
  // Получаем все категории для поиска дочерних
  const { data: allCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("is_active", true);

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError.message);
    return [];
  }

  // Создаем Set с начальной категорией и рекурсивно находим все дочерние
  const expandedCategories = new Set<string>([categoryId]);

  const findChildren = (parentId: string) => {
    allCategories?.forEach((cat: { id: string; parent_id: string | null }) => {
      if (cat.parent_id === parentId) {
        expandedCategories.add(cat.id);
        findChildren(cat.id); // Рекурсивно находим дочерние категории
      }
    });
  };

  findChildren(categoryId);

  // Получаем товары из всех категорий (включая дочерние)
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      brand:brands (id, name, slug)
    `
    )
    .in("category_id", Array.from(expandedCategories))
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Трансформируем данные в формат CatalogProduct для ProductGrid
  return data.map((product: any) => {
    // Обработка изображений
    let images: string[] = [];
    if (product.images) {
      if (Array.isArray(product.images)) {
        images = product.images
          .map((img: any) => {
            if (typeof img === "string") return img.trim();
            if (typeof img === "object" && img?.url) return img.url.trim();
            return null;
          })
          .filter((url: any): url is string => 
            url && typeof url === "string" && url.length > 0
          );
      } else if (typeof product.images === "string") {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            images = parsed
              .map((img: any) => typeof img === "string" ? img : img?.url)
              .filter(Boolean);
          }
        } catch {
          images = [product.images];
        }
      }
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      short_description: product.short_description,
      description: product.description,
      base_price: product.base_price || 0,
      sale_price: product.sale_price,
      thumbnail: product.thumbnail,
      images: images,
      inventory_quantity: product.inventory_quantity || 0,
      track_inventory: product.track_inventory || false,
      is_featured: product.is_featured || false,
      status: product.status || "active",
      created_at: product.created_at,
      view_count: product.view_count || 0,
      sales_count: product.sales_count || 0,
      brands: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      categories: product.category ? {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
        level: product.category.level || 0,
      } : null,
    } as CatalogProduct;
  });
}

// Генерация метаданных для SEO
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugs = resolvedParams.slugs;

  if (!slugs || slugs.length === 0) {
    return {
      title: "Категория не найдена",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const supabase = await createServerClient();
  const resolved = await resolveCategoryChain(slugs, supabase);

  if (!resolved || !resolved.category) {
    return {
      title: "Категория не найдена",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const { category } = resolved;
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';
  const categoryPath = `/catalog/${slugs.join("/")}`;
  const categoryUrl = `${siteBaseUrl}${categoryPath}`;
  
  const title = category.meta_title || `${category.name} | Каталог - ${COMPANY_NAME_SHORT}`;
  const description = category.meta_description || category.description || 
    `${category.name}. ${COMPANY_NAME_SHORT} - официальный дилер систем безопасности и автоматизации в Казахстане.`;
  const keywords = category.meta_keywords?.split(",").map(k => k.trim()).filter(Boolean) || 
    [category.name, "каталог", "Казахстан", COMPANY_NAME_SHORT];

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: categoryPath,
    },
    openGraph: {
      title: category.name,
      description,
      url: categoryUrl,
      siteName: COMPANY_NAME_SHORT,
      type: 'website',
      locale: 'ru_RU',
      images: category.image_url ? [
        {
          url: category.image_url,
          width: 1200,
          height: 630,
          alt: category.name,
        }
      ] : [],
    },
    twitter: {
      card: category.image_url ? 'summary_large_image' : 'summary',
      title: category.name,
      description,
      images: category.image_url ? [category.image_url] : [],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slugs;

  // Валидация slugs
  if (!slugs || slugs.length === 0) {
    notFound();
  }

  const supabase = await createServerClient();

  // 1. Получаем категорию по цепочке parent_id/slug
  const resolved = await resolveCategoryChain(slugs, supabase);
  if (!resolved || !resolved.category) {
    notFound();
  }

  const { category: currentCategory, chain: breadcrumbCategories } = resolved;

  // 2. Дочерние категории
  const childCategories = await getChildCategories(currentCategory.id, supabase);

  // 3. Товары НЕ загружаем на сервере - загружаются только на клиенте через TanStack Query
  // Это ускоряет первую загрузку страницы

  // 4. Хлебные крошки
  let currentPath = "/catalog";
  const breadcrumbItems = breadcrumbCategories.map((cat) => {
    currentPath += `/${cat.slug}`;
    return {
      name: cat.name,
      href: currentPath,
      slug: cat.slug,
    };
  });

  // 5. HTML описание (с базовой санитизацией)
  const categoryDescription = currentCategory.description_html || currentCategory.description || "";

  // Breadcrumbs для JSON-LD
  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';
  const breadcrumbJsonLdItems = [
    { name: 'Главная', url: '/' },
    { name: 'Каталог', url: '/catalog' },
    ...breadcrumbItems.map(item => ({
      name: item.name,
      url: item.href,
    })),
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} />
      <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Хлебные крошки */}
        <Breadcrumb className="mb-6 md:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/catalog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Каталог
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbSeparator className="text-muted-foreground/50" />
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.name}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Описание и баннер категории */}
        <section className="mb-8 md:mb-12 pb-6 md:pb-8 border-b border-border">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Текстовая часть */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                {currentCategory.name}
              </h1>
              {categoryDescription && (
                <div className="mt-4">
                  <CategoryDescription content={categoryDescription} />
                </div>
              )}
            </div>
            
            {/* Изображение категории - показываем только если нет длинного описания */}
            {currentCategory.image_url && (!categoryDescription || categoryDescription.replace(/<[^>]*>/g, '').length < 300) && (
              <div className="flex-shrink-0 w-full lg:w-80 xl:w-96">
                <div className="relative w-full aspect-square lg:aspect-[4/3] rounded-xl overflow-hidden border border-border shadow-lg bg-muted">
                  <Image
                    src={currentCategory.image_url}
                    alt={currentCategory.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 384px"
                    priority
                    quality={85}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Подкатегории - компактная сетка */}
        {childCategories.length > 0 && (
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {childCategories.map((childCat: { id: string; name: string; slug: string; description?: string | null; image_url?: string | null }) => (
                <Link
                  key={childCat.id}
                  href={`/catalog/${[...slugs, childCat.slug].join("/")}`}
                  className="group flex flex-col items-center p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  {/* Изображение категории */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    {childCat.image_url ? (
                      <Image
                        src={childCat.image_url}
                        alt={childCat.name}
                        fill
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-200"
                        sizes="(max-width: 640px) 64px, 80px"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <LayoutGrid className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground opacity-50" />
                    )}
                  </div>
                  
                  {/* Название категории */}
                  <h3 className="text-sm sm:text-base font-medium text-foreground text-center group-hover:text-primary transition-colors line-clamp-2">
                    {childCat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Сетка товаров */}
        <section>
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Товары
            </h2>
          </div>
          <CategoryProductsClient slugs={slugs} />
        </section>
      </div>
    </div>
    </>
  );
}