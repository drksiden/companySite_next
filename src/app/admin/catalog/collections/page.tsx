import { createServerClient } from "@/lib/supabaseServer";
import { CollectionManagerClient } from "@/components/admin/CollectionManagerClient";

export default async function CollectionsPage() {
  const supabase = await createServerClient();
  const { data: collections } = await supabase.from("collections").select("*");
  const { data: brands } = await supabase.from("brands").select("*");
  const { data: categories } = await supabase.from("categories").select("*");

  if (!collections || !brands || !categories) {
    return <div>Ошибка загрузки данных.</div>;
  }

  return (
    <div className="p-6">
      <CollectionManagerClient
        initialCollections={collections}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
