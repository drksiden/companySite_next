import { fetchCategoryByHandle, fetchProducts } from '@/lib/medusaClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Catalog } from '@/components/Catalog';

export async function generateMetadata({
  params,
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}): Promise<Metadata> {
  const { subCategoryHandle } = params;
  const { product_category } = await fetchCategoryByHandle(subCategoryHandle);

  return {
    title: product_category?.name || 'Подкатегория',
    description: product_category?.description || 'Описание подкатегории',
  };
}

export default async function SubCategoryPage({
  params,
}: {
  params: { categoryHandle: string; subCategoryHandle: string };
}) {
  const { subCategoryHandle } = params;

  try {
    const { product_category } = await fetchCategoryByHandle(subCategoryHandle);

    if (!product_category) return notFound();

    const categoryId = product_category.id;
    const { products } = await fetchProducts(categoryId);

    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
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
    console.error('Ошибка при загрузке подкатегории:', error);
    return (
      <div className="py-16 px-6 max-w-7xl mx-auto">
        <p className="text-center text-destructive">Ошибка загрузки подкатегории. Попробуйте позже.</p>
      </div>
    );
  }
}
