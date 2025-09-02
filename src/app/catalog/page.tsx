import { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import CatalogShell from "@/features/catalog/components/CatalogShell";
import LoadingSkeletons from "@/features/catalog/components/LoadingSkeletons";
import {
  listProducts,
  listCategories,
  listBrands,
} from "@/lib/services/catalog";

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

export default function CatalogPage({ searchParams }: CatalogPageProps) {

  return (
    <div className="min-h-screen bg-background">
      <CatalogShell/>
    </div>
  );
}
