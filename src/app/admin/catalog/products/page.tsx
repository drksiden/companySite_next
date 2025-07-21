import { createClient } from '@/utils/supabase/server';
import { ProductManagerClient } from '@/components/admin/ProductManagerClient';

export default async function ProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase.from('products').select('*');
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: brands } = await supabase.from('brands').select('*');
  const { data: collections } = await supabase.from('collections').select('*');
  const { data: currencies } = await supabase.from('currencies').select('*');

  if (!products || !categories || !brands || !collections || !currencies) {
    return <div>Ошибка загрузки данных.</div>;
  }

  return (
    <div className="p-6">
      <ProductManagerClient
        initialProducts={products}
        categories={categories}
        brands={brands}
        collections={collections}
        currencies={currencies}
      />
    </div>
  );
}