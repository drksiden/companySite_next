import Medusa from '@medusajs/medusa-js';

const medusa = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000',
  maxRetries: 3,
});

export async function getProducts() {
  const { products } = await medusa.products.list();
  return products;
}

export async function getProductBySlug(slug: string) {
  const { products } = await medusa.products.list({ handle: slug });
  return products[0] || null;
}

export async function getCategories() {
  const { product_categories } = await medusa.productCategories.list();
  return product_categories;
}

export async function getProductsByCategory(categorySlug: string) {
  const { products } = await medusa.products.list({ category_id: [categorySlug] });
  return products;
}

export async function getProductsByManufacturer(manufacturerSlug: string) {
  // Предполагаем, что производитель — это кастомное поле или фильтр
  const { products } = await medusa.products.list({ 'metadata.manufacturer_slug': manufacturerSlug });
  return products;
}

export default medusa;