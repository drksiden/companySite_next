"use client"

import { ContentLayout } from '@/components/admin-panel/content-layout';
import CategoryFormClient from './CategoryFormClient';

export default function AdminCatalogCategoriesPage() {
  return (
    <div className="p-6">
      <ContentLayout title="Категории">
        <CategoryFormClient />
      </ContentLayout>
    </div>
  );
}
