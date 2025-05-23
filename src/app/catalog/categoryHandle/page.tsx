import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { HttpTypes } from '@medusajs/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { CategoryCardList } from '@/components/CategoryCardList';
import { Package } from 'lucide-react';

export const revalidate = 3600;

type ProductCategoryType = HttpTypes.StoreProductCategory;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryHandle: string }>;
}): Promise<Metadata> {
  const { categoryHandle } = await params;
  console.log(`[Metadata] /catalog/${categoryHandle}`);
  try {
    const { product_categories } = await sdk.store.category.list({
      handle: categoryHandle,
      limit: 1,
      fields: "id,name,handle,description,metadata",
    });
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

interface CategorySubcategoriesPageData {
  currentCategory: ProductCategoryType;
  subCategories: ProductCategoryType[];
  parentCategories: ProductCategoryType[];
}

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
    const category = initialCategories[0];
    const subCategories = category.category_children || [];

    const parentCategories: ProductCategoryType[] = [];
    let currentParentId: string | null | undefined = category.parent_category_id as (string | null | undefined);
    let safetyCounter = 0;

    while (currentParentId && safetyCounter < 10) {
      safetyCounter++;
      try {
        const { product_category: parent } = await sdk.store.category.retrieve(
          currentParentId,
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
    console.log(`[getCategorySubcategoriesData] Parent categories built:`, parentCategories.map(p => p.name));

    return { currentCategory: category, subCategories, parentCategories };
  } catch (error) {
    console.error(`[Page Data Error] Category '${categoryHandle}':`, error);
    return null;
  }
}

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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryHandle: string }>;
}) {
  const { categoryHandle } = await params;
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
          <CategoryCardList
            categories={subCategories}
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