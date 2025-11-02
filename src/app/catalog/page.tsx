import { Metadata } from "next";
import CatalogShell from "@/features/catalog/components/CatalogShell";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description:
    "Широкий ассортимент качественных товаров с удобными фильтрами и быстрой доставкой",
  keywords: ["каталог", "товары", "интернет-магазин", "покупки", "доставка"],
};

// Force dynamic rendering to prevent hydration issues
export const dynamic = "force-dynamic";

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <CatalogShell searchParams={resolvedSearchParams} />
    </div>
  );
}
