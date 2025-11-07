import { Metadata } from "next";
import { notFound } from "next/navigation";
import { sdk } from "@/lib/sdk";
import { COMPANY_NAME_SHORT } from "@/data/constants";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCardList } from "@/components/ProductCardList";
import { CategoryCardList } from "@/components/CategoryCardList";
import { Package } from "lucide-react";

export const revalidate = 3600;

type ProductCategoryType = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  parent_category?: ProductCategoryType | null;
  category_children?: ProductCategoryType[];
  ancestors?: ProductCategoryType[];
  image_url?: string;
  sort_order: number;
  status: "active" | "inactive";
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
};

type ProductType = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  status: "active" | "inactive" | "draft";
  images: string[];
  category_id?: string;
  brand_id?: string;
  attributes?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryHandle: string; subCategoryHandle: string }>;
}): Promise<Metadata> {
  const { categoryHandle, subCategoryHandle } = await params;
  console.log(`[Metadata] /${categoryHandle}/${subCategoryHandle}`);
  try {
    const parentCategoriesList = await sdk.catalog.getCategories({
      status: "active",
    });
    const parentCategory = parentCategoriesList?.find(
      (cat) => cat.slug === categoryHandle,
    );
    const subCategoriesList = await sdk.catalog.getCategories({
      status: "active",
    });
    const subCategory = subCategoriesList?.find(
      (cat) => cat.slug === subCategoryHandle,
    );

    if (!subCategory) {
      return { title: `Подкатегория не найдена | ${COMPANY_NAME_SHORT}` };
    }
    if (parentCategory && subCategory.parent_id !== parentCategory.id) {
      return {
        title: "Некорректный путь категории",
        description: "Структура категорий не соответствует.",
      };
    }

    const pageTitleBase = parentCategory
      ? `${subCategory.name} | ${parentCategory.name}`
      : subCategory.name;
    const pageTitle = `${pageTitleBase} | Каталог | ${COMPANY_NAME_SHORT}`;
    const pageDescription =
      subCategory.description ||
      `Обзор подкатегории ${subCategory.name}${parentCategory ? ` раздела ${parentCategory.name}` : ""}. Товары и дальнейшие разделы. ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/catalog/${categoryHandle}/${subCategoryHandle}`;
    const ogImage =
      (subCategory.metadata?.image_url as string) ||
      (subCategory.metadata?.thumbnail_url as string) ||
      null;

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: canonicalUrl,
        type: "website",
        images: ogImage ? [{ url: ogImage }] : [],
      },
    };
  } catch (error) {
    console.error(
      `[Metadata Error] /${categoryHandle}/${subCategoryHandle}:`,
      error,
    );
    return { title: `Ошибка загрузки | ${COMPANY_NAME_SHORT}` };
  }
}

interface SubCategoryContentPageData {
  parentCategoryForBreadcrumbs: ProductCategoryType | null;
  currentSubCategory: ProductCategoryType;
  products: ProductType[];
  subSubCategories: ProductCategoryType[];
  grandParentCategories: ProductCategoryType[];
}

async function getSubCategoryContentData(
  categoryHandle: string,
  subCategoryHandle: string,
): Promise<SubCategoryContentPageData | null> {
  console.log(
    `[getSubCategoryContentData] For /${categoryHandle}/${subCategoryHandle}`,
  );
  try {
    // 1. Получаем родительскую категорию
    let parentCategory: ProductCategoryType | null = null;
    const parentCategoryList = await sdk.catalog.getCategories({
      status: "active",
    });

    if (parentCategoryList && parentCategoryList.length > 0) {
      parentCategory =
        parentCategoryList.find((cat) => cat.slug === categoryHandle) || null;
    }

    // 2. Сначала получаем базовую информацию о подкатегории для проверки связи с родительской
    const initialSubCategories = await sdk.catalog.getCategories({
      status: "active",
    });
    const foundSubCategory = initialSubCategories?.find(
      (cat) => cat.slug === subCategoryHandle,
    );

    if (!foundSubCategory) {
      return null;
    }

    const subCategoryId = foundSubCategory.id;
    const initialSubCategoryParentId = foundSubCategory.parent_id;

    // Проверка валидности пути
    if (!parentCategory || initialSubCategoryParentId !== parentCategory.id) {
      console.warn(
        `[getSubCategoryContentData] Path inconsistency: parent '${categoryHandle}' (id: ${parentCategory?.id}), sub '${subCategoryHandle}' (parent_id: ${initialSubCategoryParentId})`,
      );
      return null;
    }

    // 3. Получаем детальную информацию о текущей подкатегории
    const currentSubCategory = await sdk.catalog.getCategory(subCategoryId);

    if (!currentSubCategory) {
      return null;
    }

    console.log(
      "[getSubCategoryContentData] Current subCategory retrieved:",
      JSON.stringify(
        {
          id: currentSubCategory.id,
          name: currentSubCategory.name,
          has_children: Boolean(currentSubCategory.category_children?.length),
        },
        null,
        2,
      ),
    );

    // 4. Получаем подкатегории текущей категории
    let subSubCategories: ProductCategoryType[] = [];

    // Get subcategories
    const childCategories = await sdk.catalog.getCategories({
      parent_id: currentSubCategory.id,
      status: "active",
    });
    subSubCategories = childCategories || [];

    console.log(
      `[getSubCategoryContentData] Final sub-subcategories count: ${subSubCategories.length}`,
    );
    if (subSubCategories.length > 0) {
      console.log(
        `[getSubCategoryContentData] Sub-subcategories:`,
        subSubCategories.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
        })),
      );
    }

    // 5. Загружаем товары для текущей подкатегории
    let products: ProductType[] = [];
    const fetchedProducts = await sdk.catalog.getProducts({
      category: currentSubCategory.id,
      limit: 24,
    });
    const count = fetchedProducts.length;

    products = fetchedProducts as ProductType[];
    console.log(
      `[getSubCategoryContentData] Products for subCategory '${currentSubCategory.name}': API count=${count}, fetched=${products.length}`,
    );

    // 6. Собираем предков для хлебных крошек
    const grandParentCategories: ProductCategoryType[] = [];

    if (
      currentSubCategory.ancestors &&
      Array.isArray(currentSubCategory.ancestors)
    ) {
      const directParentFromAncestors = currentSubCategory.ancestors.find(
        (a: ProductCategoryType) => a.id === parentCategory?.id,
      );
      if (directParentFromAncestors && directParentFromAncestors.ancestors) {
        grandParentCategories.push(
          ...(directParentFromAncestors.ancestors.filter(
            Boolean,
          ) as ProductCategoryType[]),
        );
      }
    } else if (parentCategory?.parent_id) {
      let currentGrandParentId: string | null | undefined =
        parentCategory.parent_id;
      let safetyCounter = 0;

      while (currentGrandParentId && safetyCounter < 10) {
        safetyCounter++;
        try {
          const grandParent =
            await sdk.catalog.getCategory(currentGrandParentId);

          if (grandParent) {
            grandParentCategories.unshift(grandParent);
            currentGrandParentId = grandParent.parent_id;
          } else {
            currentGrandParentId = null;
          }
        } catch (err) {
          currentGrandParentId = null;
        }
      }
    }

    const breadcrumbParents = [
      ...grandParentCategories,
      ...(parentCategory ? [parentCategory] : []),
    ];

    return {
      parentCategoryForBreadcrumbs: parentCategory,
      currentSubCategory,
      products,
      subSubCategories,
      grandParentCategories: breadcrumbParents,
    };
  } catch (error) {
    console.error(
      `[Page Data Error FINAL CATCH] /${categoryHandle}/${subCategoryHandle}:`,
      error,
    );
    return null;
  }
}

function generateBreadcrumbItems(
  currentCategory: ProductCategoryType,
  breadcrumbAncestorCategories: ProductCategoryType[],
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: "Каталог", href: "/catalog" },
  ];

  let accumulatedPath = "/catalog";
  breadcrumbAncestorCategories.forEach((ancestor) => {
    if (ancestor.id !== currentCategory.id) {
      accumulatedPath += `/${ancestor.slug}`;
      items.push({ label: ancestor.name, href: accumulatedPath });
    }
  });

  const finalPathForCurrent = `${accumulatedPath}/${currentCategory.slug}`;
  if (items[items.length - 1]?.href !== finalPathForCurrent) {
    items.push({ label: currentCategory.name, href: finalPathForCurrent });
  }

  return items;
}

export default async function SubCategoryPage({
  params,
}: {
  params: Promise<{ categoryHandle: string; subCategoryHandle: string }>;
}) {
  const { categoryHandle, subCategoryHandle } = await params;
  const pageData = await getSubCategoryContentData(
    categoryHandle,
    subCategoryHandle,
  );

  if (!pageData) {
    notFound();
  }

  const {
    currentSubCategory,
    products,
    subSubCategories,
    grandParentCategories: breadcrumbAncestors,
  } = pageData;
  const breadcrumbItems = generateBreadcrumbItems(
    currentSubCategory,
    breadcrumbAncestors,
  );

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">
          {currentSubCategory.name}
        </h1>
        {currentSubCategory.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">
            {currentSubCategory.description}
          </p>
        )}
      </header>

      {subSubCategories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">
            Выберите подраздел
          </h2>
          <CategoryCardList
            categories={subSubCategories.map((cat) => ({
              id: cat.id,
              name: cat.name,
              handle: cat.slug,
              description: cat.description,
              parent_id: cat.parent_id,
              image_url: cat.image_url,
              created_at: cat.created_at,
              is_active: cat.status === "active",
            }))}
            basePath={`/catalog/${categoryHandle}/${currentSubCategory.slug}`}
          />
        </section>
      )}

      {products.length > 0 && (
        <section className={subSubCategories.length > 0 ? "mt-12" : ""}>
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">
            Товары {`в "${currentSubCategory.name}"`}
          </h2>
          <ProductCardList
            products={products.map((product) => ({
              id: product.id,
              created_at: product.created_at,
              name: product.name,
              description: product.description || null,
              image_urls: product.images || null,
              category_id: product.category_id || null,
              brand_id: product.brand_id || null,
              handle: product.slug || null,
              sku: product.sku || null,
              price: product.price || null,
              original_price: product.sale_price || null,
              currency_code: "₸",
              stock_quantity: product.stock_quantity || null,
              allow_backorder: false,
              metadata: product.attributes || null,
              is_active: product.status === "active",
            }))}
          />
        </section>
      )}

      {subSubCategories.length === 0 && products.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground/70" />
          <p className="text-xl text-muted-foreground">
            В этом разделе пока нет товаров или дальнейших подкатегорий.
          </p>
        </div>
      )}
    </div>
  );
}
