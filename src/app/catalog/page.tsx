import { Catalog } from '@/components/Catalog';
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

  return <Catalog initialProducts={initialProducts} initialCategories={initialCategories} />;
}