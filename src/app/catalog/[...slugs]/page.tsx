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
import { LayoutGrid, ImageOff } from 'lucide-react'; // Иконка для карточек подкатегорий и placeholder
import Image from 'next/image'; // For product thumbnails
import { Badge } from "@/components/ui/badge"; // For availability status

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
    
    let products: Product[] = [];
    if (currentCategory?.id) {
      try {
        const { products: fetchedProducts } = await sdk.store.product.list({ 
          category_id: [currentCategory.id], 
          limit: 20, // Fetch up to 20 products
          fields: 'id,title,handle,thumbnail,description,variants.prices,variants.inventory_quantity', // Added description
        });
        products = fetchedProducts;
      } catch (productError) {
        console.error(`Failed to fetch products for category ${currentCategory.id}:`, productError);
        // products will remain an empty array
      }
    }

    return {
      category: currentCategory,
      products: products, 
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

// Removed RecursiveCategoryList from here as it's now in src/components/categories/RecursiveCategoryList.tsx

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

        {/* Подкатегории - This section will be removed as the sidebar will handle category navigation. 
            The main content area should focus on the current category's products and details.
            If the current category has children, the sidebar will display them.
            We might still want to show subcategory cards if there are no products,
            but the primary navigation moves to the sidebar.
            For now, removing this section entirely to avoid redundancy with the sidebar.
        */}
        {/* 
        {childrenCategories && childrenCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">Подкатегории</h2>
            // The RecursiveCategoryList call was here
          </section>
        )}
        */}

        {/* Товары */}
        <section>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
            Товары в категории "{category.name}"
          </h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => {
                const price = product.variants?.[0]?.prices?.[0]?.amount;
                const formattedPrice = price 
                  ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(price / 100) // Assuming price is in cents
                  : 'Цена не указана';

                return (
                  <Link key={product.id} href={`/product/${product.handle}`} passHref legacyBehavior>
                    <a className="block group">
                      <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500 transform hover:-translate-y-1">
                        <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 rounded-t-2xl overflow-hidden">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title || 'Product image'}
                              fill
                              style={{ objectFit: 'cover' }}
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <ImageOff className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="text-md font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 mb-1">
                            {product.title}
                          </CardTitle>
                          {product.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                              {product.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-grow flex flex-col justify-end">
                          <div>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                              {formattedPrice}
                            </p>
                            {product.variants && product.variants.length > 0 && (
                              <Badge variant={product.variants[0].inventory_quantity && product.variants[0].inventory_quantity > 0 ? "default" : "destructive"} className={`text-xs ${product.variants[0].inventory_quantity && product.variants[0].inventory_quantity > 0 ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 border-green-300' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 border-red-300'}`}>
                                {product.variants[0].inventory_quantity && product.variants[0].inventory_quantity > 0 ? 'В наличии' : 'Нет в наличии'}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </Link>
                );
              })}
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