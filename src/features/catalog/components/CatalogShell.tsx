"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FiltersSidebar from "./FiltersSidebar";
import SortSelect from "./SortSelect";
import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import LoadingSkeletons from "./LoadingSkeletons";
import { ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CatalogProduct,
  CategoryItem,
  BrandItem,
} from "@/lib/services/catalog";

interface CatalogShellProps {
  initialProducts: CatalogProduct[];
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
  initialMeta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function CatalogShell({
  initialProducts,
  initialCategories,
  initialBrands,
  initialMeta,
}: CatalogShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [meta, setMeta] = useState(
    initialMeta || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  );

  // Get current filters from URL
  const currentFilters = {
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
    sort: searchParams.get("sort") || "name.asc",
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
    brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
    collections:
      searchParams.get("collections")?.split(",").filter(Boolean) || [],
    minPrice: searchParams.get("minPrice")
      ? parseFloat(searchParams.get("minPrice")!)
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? parseFloat(searchParams.get("maxPrice")!)
      : undefined,
    inStockOnly: searchParams.get("inStockOnly") === "1",
    search: searchParams.get("search") || "",
  };

  // Fetch products when filters change
  const fetchProducts = async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`/api/catalog/products?${queryString}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      if (result.success) {
        setProducts(result.data);
        setMeta(result.meta);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL and fetch products
  const updateFilters = (newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams();

    // Merge current filters with new ones
    const updatedFilters = { ...currentFilters, ...newFilters };

    // Reset to page 1 if not explicitly setting page
    if (!newFilters.page) {
      updatedFilters.page = 1;
    }

    // Build query params
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(","));
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });

    // Update URL
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);

    // Fetch new products
    const fetchParams: Record<string, string> = {};
    params.forEach((value, key) => {
      fetchParams[key] = value;
    });
    fetchProducts(fetchParams);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    updateFilters({ page });
    // Scroll to top of catalog
    document
      .getElementById("catalog-top")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    updateFilters({ sort });
  };

  // Handle filter changes
  const handleFiltersChange = (filters: Partial<typeof currentFilters>) => {
    updateFilters(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    router.replace(window.location.pathname);
    fetchProducts({});
  };

  // Check if any filters are active
  const hasActiveFilters = Boolean(
    currentFilters.categories.length > 0 ||
      currentFilters.brands.length > 0 ||
      currentFilters.collections.length > 0 ||
      currentFilters.minPrice ||
      currentFilters.maxPrice ||
      currentFilters.inStockOnly ||
      currentFilters.search,
  );

  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
          <p className="text-muted-foreground mt-2">
            Найдено {meta.total} товаров
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
            {hasActiveFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>

          {/* Sort selector */}
          <SortSelect value={currentFilters.sort} onChange={handleSortChange} />
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Активные фильтры:</span>

                {currentFilters.search && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    Поиск: "{currentFilters.search}"
                    <button
                      onClick={() => handleFiltersChange({ search: "" })}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {currentFilters.categories.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    Категории: {currentFilters.categories.length}
                    <button
                      onClick={() => handleFiltersChange({ categories: [] })}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {currentFilters.brands.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Бренды: {currentFilters.brands.length}
                    <button
                      onClick={() => handleFiltersChange({ brands: [] })}
                      className="hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {(currentFilters.minPrice || currentFilters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                    Цена: {currentFilters.minPrice || 0} -{" "}
                    {currentFilters.maxPrice || "∞"} ₸
                    <button
                      onClick={() =>
                        handleFiltersChange({
                          minPrice: undefined,
                          maxPrice: undefined,
                        })
                      }
                      className="hover:bg-orange-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}

                {currentFilters.inStockOnly && (
                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    Только в наличии
                    <button
                      onClick={() =>
                        handleFiltersChange({ inStockOnly: false })
                      }
                      className="hover:bg-purple-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Очистить все
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div
          className={cn(
            "lg:w-80 lg:flex-shrink-0",
            "lg:block", // Always visible on desktop
            filtersOpen ? "block" : "hidden", // Toggle on mobile
          )}
        >
          <div className="lg:sticky lg:top-8">
            <FiltersSidebar
              categories={initialCategories}
              brands={initialBrands}
              currentFilters={currentFilters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <LoadingSkeletons />
          ) : products.length === 0 ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <Suspense fallback={<LoadingSkeletons />}>
                <ProductGrid products={products} />
              </Suspense>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasPrev || loading}
                    onClick={() => handlePageChange(meta.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Назад
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, meta.totalPages) },
                      (_, i) => {
                        let pageNum: number;

                        if (meta.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (meta.page <= 3) {
                          pageNum = i + 1;
                        } else if (meta.page >= meta.totalPages - 2) {
                          pageNum = meta.totalPages - 4 + i;
                        } else {
                          pageNum = meta.page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === meta.page ? "default" : "outline"
                            }
                            size="sm"
                            disabled={loading}
                            onClick={() => handlePageChange(pageNum)}
                            className="w-10"
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.hasNext || loading}
                    onClick={() => handlePageChange(meta.page + 1)}
                  >
                    Вперед
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Results info */}
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Показано {products.length} из {meta.total} товаров
                {meta.totalPages > 1 && (
                  <span>
                    {" "}
                    • Страница {meta.page} из {meta.totalPages}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
