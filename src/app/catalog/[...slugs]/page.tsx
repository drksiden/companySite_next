import React from 'react';
import { sdk } from '@/lib/sdk';
import { HttpTypes } from "@medusajs/types";
type Product = HttpTypes.StoreProduct; 

import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Separator } from "@/components/ui/separator"; 
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"; 
import { LayoutGrid } from 'lucide-react'; // Иконка для карточек подкатегорий

interface CategoryPageProps {
  params: {
    slugs: string[];
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

interface CategoryData {
  category: HttpTypes.StoreProductCategory | null;
  products: Product[]; 
}

interface BreadcrumbInfo {
  name: string;
  href: string;
  handle: string;
}

async function getCategoryData(handle: string): Promise<CategoryData> {
  try {
    const params: HttpTypes.StoreProductCategoryListParams = {
        handle: handle,
        is_active: true, 
        fields: 'id,name,handle,description,parent_category_id,mpath,' + 
                'category_children.id,category_children.name,category_children.handle,category_children.description,category_children.parent_category_id,category_children.mpath', 
        include_descendants_tree: true, 
        limit: 1, 
    };
    
    const { product_categories } = await sdk.store.category.list(params);

    if (!product_categories || product_categories.length === 0) {
      console.warn(`Category with handle "${handle}" not found or not active.`);
      return { category: null, products: [] };
    }

    const currentCategory = product_categories[0];
    
    // TODO: Загрузка товаров для текущей категории
    // const { products } = await sdk.store.product.list({ category_id: [currentCategory.id], limit: 10 /*, ...другие параметры */ });

    return {
      category: currentCategory,
      products: [], 
    };
  } catch (error) {
    console.error(`Failed to fetch category data for handle ${handle}:`, error);
    return { category: null, products: [] }; 
  }
}

async function getBreadcrumbData(slugs: string[]): Promise<BreadcrumbInfo[]> {
  const breadcrumbs: BreadcrumbInfo[] = [];
  let currentPath = '/catalog';

  for (const slug of slugs) {
    currentPath += `/${slug}`;
    try {
      const { product_categories } = await sdk.store.category.list({ 
          handle: slug, 
          fields: 'name,handle', 
          is_active: true,
          limit: 1 
      });
      if (product_categories && product_categories.length > 0) {
        breadcrumbs.push({ name: product_categories[0].name, href: currentPath, handle: product_categories[0].handle });
      } else {
        console.warn(`Breadcrumb part not found for slug: ${slug} at path ${currentPath}`);
        breadcrumbs.push({ name: slug, href: currentPath, handle: slug }); 
      }
    } catch (error) {
        console.error(`Error fetching breadcrumb for slug ${slug} at path ${currentPath}:`, error);
        breadcrumbs.push({ name: slug, href: currentPath, handle: slug }); 
    }
  }
  return breadcrumbs;
}


export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slugs } = params;
  const currentCategoryHandle = slugs[slugs.length - 1];

  const breadcrumbItems = await getBreadcrumbData(slugs);
  
  const lastResolvedBreadcrumb = breadcrumbItems.length > 0 ? breadcrumbItems[breadcrumbItems.length -1] : null;
  if (!lastResolvedBreadcrumb || lastResolvedBreadcrumb.handle !== currentCategoryHandle || breadcrumbItems.some((b, index) => b.name === b.handle && index < breadcrumbItems.length -1 )) {
      console.warn("Invalid category path based on breadcrumbs resolution. Slugs:", slugs.join('/'), "Resolved breadcrumbs:", breadcrumbItems);
      notFound(); 
  }

  const { category, products } = await getCategoryData(currentCategoryHandle);

  if (!category) {
    console.warn(`Category data for handle "${currentCategoryHandle}" resolved to null after breadcrumb validation. Triggering 404.`);
    notFound(); 
  }

  const childrenCategories = category.category_children || [];

  return (
    // Адаптируем фон страницы и основной контейнер
    <div className="bg-white dark:bg-gray-950 min-h-screen py-12 font-sans">
      <div className="container mx-auto px-4">
        {/* Стилизация хлебных крошек */}
        <Breadcrumb className="mb-8 text-sm md:text-base">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/catalog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Каталог</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item, index) => (
              <React.Fragment key={item.href}>
                <BreadcrumbSeparator className="text-gray-400 dark:text-gray-600" />
                <BreadcrumbItem>
                  {index === breadcrumbItems.length - 1 ? (
                    <BreadcrumbPage className="font-medium text-gray-800 dark:text-gray-200">{category.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{item.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <header className="mb-10 md:mb-12 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">{category.name}</h1>
          {category.description && (
            <p className="mt-3 text-base md:text-lg text-gray-600 dark:text-gray-300">{category.description}</p>
          )}
        </header>

        {/* Подкатегории */}
        {childrenCategories && childrenCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">Подкатегории</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {childrenCategories.map((childCategory) => (
                <Link
                  key={childCategory.id}
                  href={`/catalog/${slugs.join('/')}/${childCategory.handle}`} 
                  passHref
                  legacyBehavior
                >
                  <a className="block group">
                    {/* Адаптируем стиль карточек подкатегорий */}
                    <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 transform hover:-translate-y-1">
                       <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center rounded-t-2xl">
                          <LayoutGrid className="h-14 w-14 text-blue-500 dark:text-blue-400 opacity-75" />
                       </div>
                      <CardHeader className="p-5 flex-grow">
                        <CardTitle className="text-lg font-semibold text-center text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                          {childCategory.name}
                        </CardTitle>
                      </CardHeader>
                       {childCategory.description && (
                        <CardContent className="p-5 pt-0">
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-center">
                            {childCategory.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </a>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Товары */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
            Товары в категории "{category.name}"
          </h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* TODO: Заменить на реальные карточки товаров */}
              <p className="text-gray-600 dark:text-gray-400 col-span-full text-center py-4">
                Отображение товаров будет реализовано на следующем шаге.
              </p>
            </div>
          ) : (
            (childrenCategories.length === 0) && (
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-4">
                В этой категории пока нет товаров.
              </p>
            )
          )}
           {childrenCategories.length > 0 && products.length === 0 && ( 
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg py-4">
                  Выберите подкатегорию для просмотра товаров, или в этой категории нет товаров для прямого отображения.
              </p>
          )}
        </section>
      </div>
    </div>
  );
}