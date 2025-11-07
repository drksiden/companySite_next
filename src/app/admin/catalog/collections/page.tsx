import { createServerClient } from "@/lib/supabaseServer";
import { CollectionManagerClient } from "@/components/admin/CollectionManagerClient";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default async function CollectionsPage() {
  const supabase = await createServerClient();
  const { data: collections } = await supabase.from("collections").select("*");
  const { data: brands } = await supabase.from("brands").select("*");
  const { data: categories } = await supabase.from("categories").select("*");

  if (!collections || !brands || !categories) {
    return <div>Ошибка загрузки данных.</div>;
  }

  return (
    <ContentLayout title="Коллекции">
      <div className="p-6">
      <CollectionManagerClient
        initialCollections={collections}
        brands={brands}
        categories={categories}
      />
    </div>
    </ContentLayout>
  );
}
