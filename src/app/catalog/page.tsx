import { Catalog } from '@/components/Catalog';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { fetchCategories, fetchProducts, Product, ProductCategory } from '@/lib/medusaClient';

export default async function CatalogPage() {
  let initialProducts: Product[] = [];
  let initialCategories: ProductCategory[] = [];

  try {
    const { product_categories } = await fetchCategories();
    const { products } = await fetchProducts();
    initialProducts = products;
    initialCategories = product_categories;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    initialProducts = [];
    initialCategories = [];
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Каталог', href: '/catalog' }
        ]}
        className="mb-8"
      />
      <Catalog initialProducts={initialProducts} initialCategories={initialCategories} />
    </div>
  );
}