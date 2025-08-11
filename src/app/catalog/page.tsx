import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SimpleCatalog } from "@/features/catalog/components/SimpleCatalog";

export const metadata: Metadata = {
  title: "Каталог товаров",
  description: "Каталог товаров - широкий ассортимент по выгодным ценам",
};

interface CatalogPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    sortBy?: string;
    categories?: string;
    brands?: string;
    collections?: string;
    minPrice?: string;
    maxPrice?: string;
    inStockOnly?: string;
    featured?: string;
    search?: string;
  }>;
}

async function fetchCatalogData(params: Record<string, string>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    // Fetch products
    const productParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) productParams.set(key, value);
    });

    const [productsRes, categoriesRes, brandsRes] = await Promise.allSettled([
      fetch(`${baseUrl}/api/catalog/products?${productParams.toString()}`, {
        cache: "no-store",
      }),
      fetch(`${baseUrl}/api/catalog/categories`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/catalog/brands`, { cache: "no-store" }),
    ]);

    const products =
      productsRes.status === "fulfilled" && productsRes.value.ok
        ? await productsRes.value.json()
        : { success: false, data: null };

    const categories =
      categoriesRes.status === "fulfilled" && categoriesRes.value.ok
        ? await categoriesRes.value.json()
        : { success: false, data: [] };

    const brands =
      brandsRes.status === "fulfilled" && brandsRes.value.ok
        ? await brandsRes.value.json()
        : { success: false, data: [] };

    return {
      products: products.success ? products.data : null,
      categories: categories.success ? categories.data : [],
      brands: brands.success ? brands.data : [],
      collections: [], // TODO: Add collections API
    };
  } catch (error) {
    console.error("Error fetching catalog data:", error);
    return {
      products: null,
      categories: [],
      brands: [],
      collections: [],
    };
  }
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedSearchParams = await searchParams;

  // Convert search params to the format expected by the API
  const apiParams: Record<string, string> = {};
  if (resolvedSearchParams.page) apiParams.page = resolvedSearchParams.page;
  if (resolvedSearchParams.limit) apiParams.limit = resolvedSearchParams.limit;
  if (resolvedSearchParams.sortBy)
    apiParams.sortBy = resolvedSearchParams.sortBy;
  if (resolvedSearchParams.categories)
    apiParams.categories = resolvedSearchParams.categories;
  if (resolvedSearchParams.brands)
    apiParams.brands = resolvedSearchParams.brands;
  if (resolvedSearchParams.collections)
    apiParams.collections = resolvedSearchParams.collections;
  if (resolvedSearchParams.minPrice)
    apiParams.minPrice = resolvedSearchParams.minPrice;
  if (resolvedSearchParams.maxPrice)
    apiParams.maxPrice = resolvedSearchParams.maxPrice;
  if (resolvedSearchParams.inStockOnly)
    apiParams.inStockOnly = resolvedSearchParams.inStockOnly;
  if (resolvedSearchParams.featured)
    apiParams.featured = resolvedSearchParams.featured;
  if (resolvedSearchParams.search)
    apiParams.search = resolvedSearchParams.search;

  const { products, categories, brands, collections } =
    await fetchCatalogData(apiParams);

  return (
    <div className="min-h-screen bg-background">
      <SimpleCatalog
        initialProducts={products}
        initialCategories={categories}
        initialBrands={brands}
      />
    </div>
  );
}
