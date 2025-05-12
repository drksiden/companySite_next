// app/catalog/[categoryHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { HttpTypes } from '@medusajs/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CategoryCardList } from '@/components/CategoryCardList';
import { Package } from 'lucide-react';

export const revalidate = 3600;

// Используем напрямую тип из SDK
type ProductCategoryType = HttpTypes.StoreProductCategory;

// --- Генерация метаданных ---
export async function generateMetadata({
  params,
}: {
  params: { categoryHandle: string };
}): Promise<Metadata> {
  const { categoryHandle } = params;

  try {
    const { product_categories } = await sdk.store.category.list({
      handle: categoryHandle,
      limit: 1,
      fields: "id,name,handle,description,metadata",
    });
    // Приведение типа здесь не обязательно, если product_categories уже HttpTypes.StoreProductCategory[]
    const category = product_categories?.[0];

    if (!category) {
      return {
        title: `Категория не найдена | ${COMPANY_NAME_SHORT}`,
      };
    }

    const pageTitle = `${category.name} | Подкатегории | ${COMPANY_NAME_SHORT}`;
    const pageDescription = category.description || `Подкатегории раздела ${category.name}. ${COMPANY_NAME_SHORT}`;
    const canonicalUrl = `/catalog/${category.handle}`;
    const ogImage = (category.metadata?.image_url as string) || (category.metadata?.thumbnail_url as string) || null;

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        type: 'website',
        images: ogImage ? [{ url: ogImage }] : [],
      },
    };
  } catch (error) {
    console.error(`[Metadata Error] Category '${categoryHandle}':`, error);
    return {
      title: `Ошибка загрузки | ${COMPANY_NAME_SHORT}`,
    };
  }
}

// --- Интерфейс для данных страницы ---
interface CategorySubcategoriesPageData {
  currentCategory: ProductCategoryType;
  subCategories: ProductCategoryType[];
  parentCategories: ProductCategoryType[];
}

// --- Функция для получения данных страницы ---
async function getCategorySubcategoriesData(categoryHandle: string): Promise<CategorySubcategoriesPageData | null> {
  console.log(`[getCategorySubcategoriesData] Called for handle: ${categoryHandle}`);
  try {
    const { product_categories: initialCategories } = await sdk.store.category.list({
      handle: categoryHandle,
      limit: 1,
      fields: "id,name,handle,description,metadata,parent_category_id,category_children.id,category_children.name,category_children.handle,category_children.metadata,category_children.parent_category_id",
    });

    if (!initialCategories || initialCategories.length === 0) {
      console.log(`[getCategorySubcategoriesData] Category not found by handle: ${categoryHandle}`);
      return null;
    }
    // Теперь category - это HttpTypes.StoreProductCategory
    const category = initialCategories[0];
    // category_children также будут HttpTypes.StoreProductCategory[], если они есть
    const subCategories = category.category_children || [];


    const parentCategories: ProductCategoryType[] = [];
    // Тип category.parent_category_id из HttpTypes.StoreProductCategory может быть string.
    // Но логически он может быть null для корневой категории.
    // Будем обрабатывать его как string | null | undefined для безопасности в цикле.
    let currentParentId: string | null | undefined = category.parent_category_id as (string | null | undefined);
    let safetyCounter = 0;

    while (currentParentId && safetyCounter < 10) {
      safetyCounter++;
      try {
        const { product_category: parent } = await sdk.store.category.retrieve(
          currentParentId, // retrieve ожидает string
          {
            fields: "id,name,handle,parent_category_id",
          }
        );
        if (parent) {
          parentCategories.unshift(parent);
          currentParentId = parent.parent_category_id as (string | null | undefined);
        } else {
          currentParentId = null;
        }
      } catch (err) {
        console.error(`[getCategorySubcategoriesData] Error fetching parent category ${currentParentId}:`, err);
        currentParentId = null;
      }
    }
    console.log(`[getCategorySubcategoriesData] Parent categories built:`, parentCategories.map(p=>p.name));

    return { currentCategory: category, subCategories, parentCategories };

  } catch (error) {
    console.error(`[Page Data Error] Category '${categoryHandle}':`, error);
    return null;
  }
}

// --- Функция для генерации хлебных крошек ---
function generateBreadcrumbItems(
    category: ProductCategoryType,
    parents: ProductCategoryType[]
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Каталог', href: '/catalog' },
  ];
  parents.forEach(parent => {
    items.push({ label: parent.name, href: `/catalog/${parent.handle}` });
  });
  items.push({ label: category.name, href: `/catalog/${category.handle}` });
  return items;
}

// --- Компонент страницы ---
export default async function CategoryPage({
  params,
}: {
  params: { categoryHandle: string };
}) {
  const { categoryHandle } = params;
  const pageData = await getCategorySubcategoriesData(categoryHandle);

  if (!pageData) {
    notFound();
  }

  const { currentCategory, subCategories, parentCategories } = pageData;
  const breadcrumbItems = generateBreadcrumbItems(currentCategory, parentCategories);

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">{currentCategory.name}</h1>
        {currentCategory.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">{currentCategory.description}</p>
        )}
      </header>

      {subCategories.length > 0 ? (
        <section>
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">Подкатегории</h2>
          {/* CategoryCardList ожидает HttpTypes.StoreProductCategory[] */}
          <CategoryCardList categories={subCategories}
          basePath={`/catalog/${currentCategory.handle}`}
          />
          
        </section>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground/70" />
          <p className="text-xl text-muted-foreground">В этой категории нет подкатегорий.</p>
        </div>
      )}
    </div>
  );
}