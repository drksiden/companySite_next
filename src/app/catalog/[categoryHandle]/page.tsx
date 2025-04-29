import { fetchCategories, fetchProducts } from '@/lib/medusaClient';
import { notFound } from 'next/navigation';
import { Catalog } from '@/components/Catalog';

export default async function CategoryPage({ params }: { params: { categoryHandle: string } }) {
  const { product_categories } = await fetchCategories();
  const category = product_categories.find((cat) => cat.handle === params.categoryHandle);

  if (!category) return notFound();

  const categoryId = category.id;
  const { products } = await fetchProducts(categoryId);

  return (
    <Catalog
      initialProducts={products}
      initialCategories={product_categories}
    />
  );
}
