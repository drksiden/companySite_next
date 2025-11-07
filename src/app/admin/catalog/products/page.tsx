import { ContentLayout } from "@/components/admin-panel/content-layout";
import { ProductManagerNew } from "@/components/admin/ProductManagerNew";

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-6">
      <ContentLayout title="Продукты">
        <ProductManagerNew />
      </ContentLayout>
    </div>
  );
}
