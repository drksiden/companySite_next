import { ContentLayout } from "@/components/admin-panel/content-layout";
import { NewsManagerNew } from "@/components/admin/NewsManagerNew";

export default function NewsPage() {
  return (
    <div className="container mx-auto py-6">
      <ContentLayout title="Новости">
        <NewsManagerNew />
      </ContentLayout>
    </div>
  );
}

