// app/catalog/[categoryHandle]/[subCategoryHandle]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sdk } from '@/lib/sdk';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { HttpTypes } from '@medusajs/types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ProductCardList } from '@/components/ProductCardList';
import { CategoryCardList } from '@/components/CategoryCardList';
import { Package } from 'lucide-react';

export const revalidate = 3600;

type ProductCategoryType = HttpTypes.StoreProductCategory & {
  parent_category_id?: string | null;
  parent_category?: ProductCategoryType | null;
  category_children?: ProductCategoryType[];
  ancestors?: ProductCategoryType[];
};
type ProductType = HttpTypes.StoreProduct;

export async function generateMetadata({
  params: { categoryHandle, subCategoryHandle },
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}): Promise<Metadata> {
  console.log(`[Metadata] /${categoryHandle}/${subCategoryHandle}`);
  try {
    const { product_categories: parentCategoriesList } = await sdk.store.category.list({
      handle: categoryHandle,
      limit: 1,
      fields: "id,name,handle",
    });
    const parentCategory = parentCategoriesList?.[0] as ProductCategoryType | undefined;

    const { product_categories: subCategoriesList } = await sdk.store.category.list({
      handle: subCategoryHandle,
      limit: 1,
      fields: "id,name,handle,description,metadata,parent_category_id",
    });
    const subCategory = subCategoriesList?.[0] as ProductCategoryType | undefined;

    if (!subCategory) {
      return { title: `Подкатегория не найдена | ${COMPANY_NAME_SHORT}` };
    }
    if (parentCategory && subCategory.parent_category_id !== parentCategory.id) {
        return { title: "Некорректный путь категории", description: "Структура категорий не соответствует." };
    }

    const pageTitleBase = parentCategory ? `${subCategory.name} | ${parentCategory.name}` : subCategory.name;
    const pageTitle = `${pageTitleBase} | Каталог | ${COMPANY_NAME_SHORT}`;
    const pageDescription = subCategory.description || `Обзор подкатегории ${subCategory.name}${parentCategory ? ` раздела ${parentCategory.name}` : ''}. Товары и дальнейшие разделы. ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/catalog/${categoryHandle}/${subCategoryHandle}`;
    const ogImage = (subCategory.metadata?.image_url as string) || (subCategory.metadata?.thumbnail_url as string) || null;

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
    console.error(`[Metadata Error] /${categoryHandle}/${subCategoryHandle}:`, error);
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
  subCategoryHandle: string
): Promise<SubCategoryContentPageData | null> {
  console.log(`[getSubCategoryContentData] For /${categoryHandle}/${subCategoryHandle}`);
  try {
    // 1. Получаем родительскую категорию
    let parentCategory: ProductCategoryType | null = null;
    const { product_categories: parentCategoryList } = await sdk.store.category.list({
      handle: categoryHandle,
      limit: 1,
      fields: "id,name,handle,parent_category_id",
    });
    
    if (parentCategoryList && parentCategoryList.length > 0) {
      parentCategory = parentCategoryList[0] as ProductCategoryType;
    }

    // 2. Сначала получаем базовую информацию о подкатегории для проверки связи с родительской
    const { product_categories: initialSubCategories } = await sdk.store.category.list({
      handle: subCategoryHandle,
      limit: 1,
      fields: "id,parent_category_id",
    });

    if (!initialSubCategories || initialSubCategories.length === 0) {
      return null;
    }
    
    const subCategoryId = initialSubCategories[0].id;
    const initialSubCategoryParentId = initialSubCategories[0].parent_category_id;

    // Проверка валидности пути
    if (!parentCategory || initialSubCategoryParentId !== parentCategory.id) {
      console.warn(`[getSubCategoryContentData] Path inconsistency: parent '${categoryHandle}' (id: ${parentCategory?.id}), sub '${subCategoryHandle}' (parent_id: ${initialSubCategoryParentId})`);
      return null;
    }
    
    // 3. Получаем детальную информацию о текущей подкатегории
    const { product_category: currentSubCategory } = await sdk.store.category.retrieve(
      subCategoryId,
      {
        fields: "id,name,handle,description,metadata,parent_category_id",
        include_descendants_tree: true, // Важно для получения подкатегорий
        include_ancestors_tree: true,   // Для хлебных крошек
      }
    ) as { product_category: ProductCategoryType | null };

    if (!currentSubCategory) {
      return null;
    }
    
    console.log("[getSubCategoryContentData] Current subCategory retrieved:", 
      JSON.stringify({
        id: currentSubCategory.id,
        name: currentSubCategory.name,
        has_children: Boolean(currentSubCategory.category_children?.length)
      }, null, 2)
    );

    // 4. Получаем подкатегории текущей категории
    // Важно! Если category_children не приходит корректно, используем дополнительный запрос
    let subSubCategories: ProductCategoryType[] = [];
    
    if (currentSubCategory.category_children && Array.isArray(currentSubCategory.category_children)) {
      console.log(`[getSubCategoryContentData] Direct category_children count: ${currentSubCategory.category_children.length}`);
      // Фильтруем, чтобы взять только прямых потомков
      subSubCategories = currentSubCategory.category_children
        .filter(child => child.parent_category_id === currentSubCategory.id);
    }
    
    // Если не пришли дети через retrieve или их нет - делаем дополнительный запрос
    if (subSubCategories.length === 0) {
      console.log(`[getSubCategoryContentData] No children found in retrieve response, making explicit query`);
      const { product_categories: explicitChildren } = await sdk.store.category.list({
        parent_category_id: [currentSubCategory.id],
        fields: "id,name,handle,description,metadata,parent_category_id",
      });
      
      if (explicitChildren && explicitChildren.length > 0) {
        subSubCategories = explicitChildren as ProductCategoryType[];
      }
    }
    
    console.log(`[getSubCategoryContentData] Final sub-subcategories count: ${subSubCategories.length}`);
    if (subSubCategories.length > 0) {
      console.log(`[getSubCategoryContentData] Sub-subcategories:`, 
        subSubCategories.map(s => ({ id: s.id, name: s.name, handle: s.handle }))
      );
    }

    // 5. Загружаем товары для текущей подкатегории
    let products: ProductType[] = [];
    const { products: fetchedProducts, count } = await sdk.store.product.list({
      category_id: [currentSubCategory.id],
      limit: 24,
      fields: "id,title,handle,thumbnail,description,status",
    });
    
    products = fetchedProducts as ProductType[];
    console.log(`[getSubCategoryContentData] Products for subCategory '${currentSubCategory.name}': API count=${count}, fetched=${products.length}`);

    // 6. Собираем предков для хлебных крошек
    const grandParentCategories: ProductCategoryType[] = [];
    
    if (currentSubCategory.ancestors && Array.isArray(currentSubCategory.ancestors)) {
      // Используем ancestors из API, если они пришли
      const directParentFromAncestors = currentSubCategory.ancestors.find(a => a.id === parentCategory?.id);
      if (directParentFromAncestors && directParentFromAncestors.ancestors) {
        grandParentCategories.push(...(directParentFromAncestors.ancestors.filter(Boolean) as ProductCategoryType[]));
      }
    } else if (parentCategory?.parent_category_id) {
      // Иначе загружаем предков итеративно
      let currentGrandParentId: string | null | undefined = parentCategory.parent_category_id;
      let safetyCounter = 0;
      
      while (currentGrandParentId && safetyCounter < 10) {
        safetyCounter++;
        try {
          const { product_category: grandParent } = await sdk.store.category.retrieve(
            currentGrandParentId,
            { fields: "id,name,handle,parent_category_id" }
          ) as { product_category: ProductCategoryType | null };
          
          if (grandParent) {
            grandParentCategories.unshift(grandParent);
            currentGrandParentId = grandParent.parent_category_id;
          } else { 
            currentGrandParentId = null; 
          }
        } catch (err) { 
          currentGrandParentId = null; 
        }
      }
    }
    
    const breadcrumbParents = [...grandParentCategories, ...(parentCategory ? [parentCategory] : [])];

    return { 
      parentCategoryForBreadcrumbs: parentCategory, 
      currentSubCategory, 
      products, 
      subSubCategories, 
      grandParentCategories: breadcrumbParents 
    };

  } catch (error) {
    console.error(`[Page Data Error FINAL CATCH] /${categoryHandle}/${subCategoryHandle}:`, error);
    return null;
  }
}

function generateBreadcrumbItems(
  currentCategory: ProductCategoryType,
  breadcrumbAncestorCategories: ProductCategoryType[]
): Array<{ label: string; href: string }> {
  const items: Array<{ label: string; href: string }> = [
    { label: 'Каталог', href: '/catalog' },
  ];
  
  let accumulatedPath = '/catalog';
  breadcrumbAncestorCategories.forEach(ancestor => {
    if (ancestor.id !== currentCategory.id) {
      accumulatedPath += `/${ancestor.handle}`;
      items.push({ label: ancestor.name, href: accumulatedPath });
    }
  });
  
  const finalPathForCurrent = `${accumulatedPath}/${currentCategory.handle}`;
  if (items[items.length - 1]?.href !== finalPathForCurrent) {
    items.push({ label: currentCategory.name, href: finalPathForCurrent });
  }

  return items;
}

export default async function SubCategoryPage({
  params: { categoryHandle, subCategoryHandle },
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}) {
  const pageData = await getSubCategoryContentData(categoryHandle, subCategoryHandle);

  if (!pageData) {
    notFound();
  }

  const { currentSubCategory, products, subSubCategories, grandParentCategories: breadcrumbAncestors } = pageData;
  const breadcrumbItems = generateBreadcrumbItems(currentSubCategory, breadcrumbAncestors);

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      <header className="mb-12 border-b pb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3 tracking-tight">{currentSubCategory.name}</h1>
        {currentSubCategory.description && (
          <p className="text-lg text-muted-foreground max-w-3xl">{currentSubCategory.description}</p>
        )}
      </header>

      {/* Всегда отображаем секцию с подкатегориями, если они есть */}
      {subSubCategories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">Выберите подраздел</h2>
          <CategoryCardList
            categories={subSubCategories}
            basePath={`/catalog/${categoryHandle}/${currentSubCategory.handle}`}
          />
        </section>
      )}

      {/* Показываем товары независимо от наличия подкатегорий */}
      {products.length > 0 && (
        <section className={subSubCategories.length > 0 ? "mt-12" : ""}>
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-8">
            Товары {`в "${currentSubCategory.name}"`}
          </h2>
          <ProductCardList products={products} />
        </section>
      )}

      {/* Показываем заглушку только если нет ни товаров, ни подкатегорий */}
      {subSubCategories.length === 0 && products.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <Package className="h-16 w-16 mx-auto mb-6 text-muted-foreground/70" />
          <p className="text-xl text-muted-foreground">В этом разделе пока нет товаров или дальнейших подкатегорий.</p>
        </div>
      )}
    </div>
  );
}