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

async function fetchCatalogData() {
  try {
    // Fetch all products without pagination and filters for client-side processing
    const params = {
      page: "1",
      limit: "50", // Reduced limit for better performance
      sort: "name.asc",
    };

    // Fetch products and metadata in parallel
    const [productsResult, categories, brands] = await Promise.all([
      listProducts(params),
      listCategories(),
      listBrands(),
    ]);

    return {
      products: productsResult.data || [],
      categories: categories || [],
      brands: brands || [],
    };
  } catch (error) {
    console.error("Error fetching catalog data:", error);
    // Return empty data instead of throwing to prevent page crash
    return {
      products: [],
      categories: [],
      brands: [],
    };
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { products, categories, brands } = await fetchCatalogData();

  return (
    <div className="min-h-screen bg-background">
      <CatalogShell
        initialProducts={products}
        initialCategories={categories}
        initialBrands={brands}
      />
    </div>
  );
}
