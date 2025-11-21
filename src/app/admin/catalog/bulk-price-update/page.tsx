import { Metadata } from "next";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import BulkPriceUpdateClient from "@/components/admin/BulkPriceUpdateClient";

export const metadata: Metadata = {
  title: "Массовое обновление цен",
  description: "Загрузка файла с ценами для массового обновления товаров",
};

export default function BulkPriceUpdatePage() {
  return (
    <ContentLayout title="Массовое обновление цен">
      <BulkPriceUpdateClient />
    </ContentLayout>
  );
}

