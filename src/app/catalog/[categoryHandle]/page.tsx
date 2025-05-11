// @/app/catalog/[categoryHandle]/page.tsx

import { fetchCategoryByHandle, fetchProducts, ProductCategory, Product } from '@/lib/medusaClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Catalog } from '@/components/Catalog'; // Убедитесь, что этот компонент существует
import { Breadcrumbs } from '@/components/Breadcrumbs'; // Убедитесь, что этот компонент существует
import { COMPANY_NAME_SHORT } from '@/data/constants';

// --- Исправление для generateMetadata ---
export async function generateMetadata({ // Добавлено async
  params,
}: {
  params: { categoryHandle: string };
}): Promise<Metadata> {
  const awaitedParams = await params; // Добавлено await
  const { categoryHandle } = awaitedParams; // Используем awaitedParams

  try {
    const { product_category } = await fetchCategoryByHandle(categoryHandle);

    if (!product_category) {
      // Возвращаем метаданные для ненайденной страницы
      return {
        title: `Категория не найдена`,
        description: `Категория товаров с идентификатором '${categoryHandle}' не найдена.`,
      };
    }

    const pageTitle = product_category.name;
    const pageDescription = product_category.description || `Ознакомьтесь с товарами и подкатегориями в разделе ${product_category.name}. ${COMPANY_NAME_SHORT} предлагает широкий ассортимент продукции.`;
    const canonicalUrl = `/catalog/${categoryHandle}`;

    return {
      title: pageTitle,
      description: pageDescription,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${pageTitle} | ${COMPANY_NAME_SHORT}`,
        description: pageDescription,
        url: canonicalUrl,
        type: 'website',
      },
    };
  } catch (error) {
    console.error(`[Error] Generating metadata for category '${categoryHandle}':`, error); // Используем categoryHandle из awaitedParams
    return {
      title: 'Ошибка загрузки категории',
      description: 'Не удалось загрузить метаданные для этой категории.',
    };
  }
}

// --- Исправление для CategoryPage ---
export default async function CategoryPage({ // Добавлено async
  params,
}: {
  params: { categoryHandle: string };
}) {
  const awaitedParams = await params; // Добавлено await
  const { categoryHandle } = awaitedParams; // Используем awaitedParams

  let product_category: ProductCategory | null = null;
  let products: Product[] = [];
  let fetchErrorOccurred = false;

  try {
    const categoryResponse = await fetchCategoryByHandle(categoryHandle);
    product_category = categoryResponse.product_category;

    if (!product_category) {
      notFound(); // Вызовет not-found.tsx
    }

    // Убедимся, что product_category не null перед доступом к id
    if (product_category) {
        const categoryId = product_category.id;
        const productsResponse = await fetchProducts(categoryId);
        products = productsResponse.products;
    } else {
        // Эта ветка не должна выполниться из-за notFound(), но добавим для полноты
        throw new Error(`Category ${categoryHandle} resolved to null after fetch.`);
    }

  } catch (error) {
    console.error(`[Error] Loading category page for '${categoryHandle}':`, error);
    fetchErrorOccurred = true;
    // Ошибка будет перехвачена error.tsx
    // Можно бросить ошибку дальше, если не планируется специфическая обработка здесь
    // throw error;
  }

  // Отображение ошибки, если она произошла во время fetch,
  // но категория была найдена (например, ошибка загрузки продуктов)
  if (fetchErrorOccurred && product_category) {
    const errorBreadcrumbItems = [
      { label: 'Каталог', href: '/catalog' },
      { label: product_category.name, href: `/catalog/${categoryHandle}` },
      { label: 'Ошибка', href: `/catalog/${categoryHandle}` }
    ];
     return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <Breadcrumbs
          items={errorBreadcrumbItems}
          className="mb-8 justify-center"
        />
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-destructive mb-4">Ошибка загрузки данных</h1>
          <p className="text-muted-foreground">
            Не удалось загрузить товары для категории "{product_category.name}".
            Пожалуйста, попробуйте обновить страницу или вернитесь позже.
          </p>
        </div>
      </div>
    );
  }

  // Если дошли сюда, и product_category все еще null (хотя notFound должен был сработать),
  // покажем общую ошибку (но лучше полагаться на notFound() и error.tsx)
  if (!product_category) {
     return (
       <div className="py-16 px-6 max-w-7xl mx-auto text-center">
         <h1 className="text-2xl font-semibold text-destructive mb-4">Категория не найдена</h1>
         <p className="text-muted-foreground">
           Категория "{categoryHandle}" не существует.
         </p>
       </div>
     )
  }


  // Генерация хлебных крошек (убедитесь, что структура категории позволяет это)
  // Этот код - примерный, возможно, потребуется адаптация под вашу структуру данных
  const breadcrumbItems = [
    { label: 'Каталог', href: '/catalog' }
    // Здесь можно рекурсивно добавить родительские категории, если они есть в product_category
    // Например: ...generateParentBreadcrumbs(product_category.parent_category),
  ];
  // Добавляем текущую категорию
  breadcrumbItems.push({ label: product_category.name, href: `/catalog/${categoryHandle}` });


  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs
        items={breadcrumbItems}
        className="mb-8"
      />
      <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{product_category.name}</h1>
      {product_category.description && (
        <p className="text-muted-foreground mb-8 text-base lg:text-lg">{product_category.description}</p>
      )}

      <Catalog
        initialCategories={product_category.category_children || []}
        parentCategoryId={product_category.id}
        initialProducts={products}
      />
    </div>
  );
}