// @/app/catalog/[categoryHandle]/page.tsx

import { fetchCategoryByHandle, fetchProducts } from '@/lib/medusaClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Catalog } from '@/components/Catalog';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export async function generateMetadata({
  params,
}: {
  params: { categoryHandle: string };
}): Promise<Metadata> {
  const { product_category } = await fetchCategoryByHandle(params.categoryHandle);
  return {
    title: product_category?.name || 'Категория',
    description: product_category?.description || 'Описание категории',
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { categoryHandle: string };
}) {
  const { categoryHandle } = params;

  try {
    const { product_category } = await fetchCategoryByHandle(categoryHandle);

    if (!product_category) return notFound();

    const categoryId = product_category.id;
    const { products } = await fetchProducts(categoryId);

    // Формируем путь для хлебных крошек
    const breadcrumbItems = [
      { label: 'Каталог', href: '/catalog' },
      { label: product_category.name, href: `/catalog/${categoryHandle}` }
    ];

    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <Breadcrumbs
          items={breadcrumbItems}
          className="mb-8"
        />
        <h1 className="text-4xl font-bold text-foreground mb-4">{product_category.name}</h1>
        <p className="text-muted-foreground mb-8">{product_category.description || 'Описание отсутствует'}</p>

        <Catalog
          initialCategories={product_category.category_children || []}
          parentCategoryId={categoryId}
          initialProducts={products}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <Breadcrumbs
          items={[
            { label: 'Каталог', href: '/catalog' },
            { label: 'Ошибка', href: '#' }
          ]}
          className="mb-8"
        />
        <p className="text-center text-destructive">Ошибка загрузки категории. Попробуйте позже.</p>
      </div>
    );
  }
}
