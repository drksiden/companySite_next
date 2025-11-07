import { createServerClient } from "@/lib/supabaseServer";
import { BrandManagerClient } from "@/components/admin/BrandManagerClient";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function BrandsPage() {
  return (
    <div className="p-6">
      <ContentLayout title="Бренды">
        <BrandManagerClient />
      </ContentLayout>
    </div>
  );
}
