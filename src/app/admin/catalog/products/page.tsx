import { Product } from '@/types/catalog';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ProductList } from '@/components/admin/ProductList';
import ProductFormClient from './ProductFormClient';

async function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const store = await cookieStore;
          return store.getAll()
        },
      },
    }
  )
}

async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data || [];
}

export default async function AdminCatalogProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      <ProductFormClient />
      <ProductList products={products} />
    </div>
  );
}