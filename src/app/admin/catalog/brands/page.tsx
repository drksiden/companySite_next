import { createServerClient } from "@/lib/supabaseServer";
import { BrandManagerClient } from "@/components/admin/BrandManagerClient";

export default async function BrandsPage() {
  const supabase = await createServerClient();
  const { data: brands } = await supabase.from("brands").select("*");

  if (!brands) {
    return <div>Ошибка загрузки данных.</div>;
  }

  return (
    <div className="p-6">
      <BrandManagerClient initialBrands={brands} />
    </div>
  );
}
