import { createClient } from '@/utils/supabase/server';
import { BrandManagerClient } from '@/components/admin/BrandManagerClient';

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from('brands').select('*');

  if (!brands) {
    return <div>Ошибка загрузки данных.</div>;
  }

  return (
    <div className="p-6">
      <BrandManagerClient initialBrands={brands} />
    </div>
  );
} 