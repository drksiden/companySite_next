import { fetchCategoryByHandle, fetchProducts, ProductCategory, Product } from '@/lib/medusaClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Catalog } from '@/components/Catalog';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { COMPANY_NAME_SHORT } from '@/data/constants';

export async function generateMetadata({
  params,
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}): Promise<Metadata> {
  const { categoryHandle, subCategoryHandle } = params;

  try {
    const { product_category: parentCategory } = await fetchCategoryByHandle(categoryHandle);
    const { product_category: subCategory } = await fetchCategoryByHandle(subCategoryHandle);

    if (!subCategory) {
      return {
        title: `Подкатегория не найдена`,
        description: `Подкатегория товаров '${subCategoryHandle}' не найдена.`,
      };
    }
    
    // Опциональная проверка: является ли subCategory дочерней для parentCategory
    if (parentCategory && subCategory.parent_category_id !== parentCategory.id) {
       console.warn(`[Metadata] Inconsistent path: ${subCategoryHandle} is not a child of ${categoryHandle}`);
       // Можно вернуть 404 или специфичные метаданные
       return {
        title: "Некорректный путь категории",
        description: "Запрошенная структура категорий не соответствует действительности."
       }
    }

    const pageTitle = parentCategory
      ? `${subCategory.name} | ${parentCategory.name}`
      : subCategory.name;
    const pageDescription = subCategory.description || `Товары в подкатегории ${subCategory.name}${parentCategory ? ` раздела ${parentCategory.name}` : ''}. ${COMPANY_NAME_SHORT}.`;
    const canonicalUrl = `/catalog/${categoryHandle}/${subCategoryHandle}`;

    return {
      title: pageTitle, // Будет объединено с title.template из layout.tsx
      description: pageDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${pageTitle} - ${COMPANY_NAME_SHORT}`,
        description: pageDescription,
        url: canonicalUrl,
        type: 'website',
      },
    };
  } catch (error) {
    console.error(`[Error] Generating metadata for subcategory '${subCategoryHandle}' under '${categoryHandle}':`, error);
    return {
      title: 'Ошибка загрузки подкатегории',
      description: 'Не удалось загрузить метаданные для этой подкатегории.',
    };
  }
}

export default async function SubCategoryPage({
  params,
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}) {
  const { categoryHandle, subCategoryHandle } = params;
  let parentCategory: ProductCategory | null = null;
  let subCategory: ProductCategory | null = null;
  let products: Product[] = [];
  let fetchErrorOccurred = false;

  try {
    const parentCategoryResponse = await fetchCategoryByHandle(categoryHandle);
    parentCategory = parentCategoryResponse.product_category;

    const subCategoryResponse = await fetchCategoryByHandle(subCategoryHandle);
    subCategory = subCategoryResponse.product_category;

    if (!subCategory) {
      notFound(); // Подкатегория не найдена
    }

    // Проверка консистентности: subCategory должна быть дочерней для parentCategory
    // и parentCategory должна существовать, если мы хотим ее отображать в хлебных крошках
    if (!parentCategory || subCategory.parent_category_id !== parentCategory.id) {
      console.warn(`Inconsistent category structure or parent not found: parent '${categoryHandle}', sub '${subCategoryHandle}'.`);
      // Если родительская категория из URL не найдена, или подкатегория ей не принадлежит, считаем путь некорректным
      notFound();
    }

    const categoryId = subCategory.id; // Продукты загружаем для текущей подкатегории
    const productsResponse = await fetchProducts(categoryId);
    products = productsResponse.products;

  } catch (error) {
    console.error(`[Error] Loading subcategory page '${subCategoryHandle}' under '${categoryHandle}':`, error);
    fetchErrorOccurred = true;
  }

  if (fetchErrorOccurred || !subCategory || !parentCategory) { // Добавлена проверка !parentCategory для полноты данных
    const errorBreadcrumbItems = [
      { label: 'Каталог', href: '/catalog' },
      { label: categoryHandle, href: `/catalog/${categoryHandle}` },
      { label: 'Ошибка', href: `/catalog/${categoryHandle}/${subCategoryHandle}` }
    ];
    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <Breadcrumbs items={errorBreadcrumbItems} className="mb-8 justify-center" />
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-4">Ошибка загрузки подкатегории</h1>
          <p className="text-muted-foreground">
            Не удалось загрузить данные для подкатегории "{subCategoryHandle}".
            Пожалуйста, попробуйте обновить страницу или вернитесь позже.
          </p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Каталог', href: '/catalog' },
    { label: parentCategory.name, href: `/catalog/${parentCategory.handle}` },
    { label: subCategory.name, href: `/catalog/${parentCategory.handle}/${subCategory.handle}` }
  ];

    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{subCategory.name}</h1>
        {subCategory.description && (
          <p className="text-muted-foreground mb-8 text-base lg:text-lg">{subCategory.description}</p>
        )}

        <Catalog
          initialCategories={subCategory.category_children || []}
          parentCategoryId={subCategory.id} // Отображаем дочерние элементы текущей подкатегории
          initialProducts={products}
        />
      </div>
    );
}
