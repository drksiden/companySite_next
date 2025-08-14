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

interface CatalogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function fetchCatalogData(
  searchParams: Record<string, string | string[] | undefined>,
) {
  try {
    // Convert searchParams to plain object for service functions
    const params: Record<string, string> = {};
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined) {
        params[key] = Array.isArray(value) ? value[0] : value;
      }
    });

    // Fetch products and metadata in parallel
    const [productsResult, categories, brands] = await Promise.all([
      listProducts(params),
      listCategories(),
      listBrands(),
    ]);

    return {
      products: productsResult.data,
      meta: productsResult.meta,
      categories,
      brands,
    };
  } catch (error) {
    console.error("Error fetching catalog data:", error);
    throw error;
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  try {
    const { products, meta, categories, brands } = await fetchCatalogData(
      await searchParams,
    );

    return (
      <div className="min-h-screen bg-background">
        <Suspense fallback={<LoadingSkeletons count={12} />}>
          <CatalogShell
            initialProducts={products}
            initialCategories={categories}
            initialBrands={brands}
            initialMeta={meta}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Catalog page error:", error);
    notFound();
  }
}
