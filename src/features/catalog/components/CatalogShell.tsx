"use client";

import { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FiltersSidebar from "./FiltersSidebar";
import SortSelect from "./SortSelect";
import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import LoadingSkeletons from "./LoadingSkeletons";
import { Filter, X, Loader2 } from "lucide-react";
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
}

export default function CatalogShell({
  initialProducts,
  initialCategories,
  initialBrands,
}: CatalogShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allProducts] = useState<CatalogProduct[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<CatalogProduct[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [itemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingFilters, setPendingFilters] = useState<Partial<
    typeof currentFilters
  > | null>(null);
  const [isFilteringPending, setIsFilteringPending] = useState(false);

  // Get current filters from URL
  const currentFilters = {
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
    inStockOnly: searchParams.get("inStockOnly") === "true",
    search: searchParams.get("search") || "",
  };

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.short_description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower),
      );
    }

    // Apply category filter
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.categories) return false;
        const productCategory = Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories;

        if (!productCategory) return false;

        // Check if product category ID is directly selected
        if (currentFilters.categories.includes(productCategory.id)) {
          return true;
        }

        // Check if any of the selected categories is a parent of the product category
        // by checking if the selected category ID appears in the product category's path
        if (productCategory.path) {
          return currentFilters.categories.some((selectedCategoryId) => {
            // Find the selected category from initial categories list
            const selectedCategory = initialCategories.find(
              (cat) => cat.id === selectedCategoryId,
            );
            if (!selectedCategory) return false;

            // If selected category path exists in product category path, it's a parent
            return (
              productCategory.path!.includes(selectedCategory.slug) ||
              productCategory.path!.includes(selectedCategoryId)
            );
          });
        }

        return false;
      });
    }

    // Apply brand filter
    if (currentFilters.brands.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.brands) return false;
        const brandId = Array.isArray(product.brands)
          ? product.brands[0]?.id
          : product.brands.id;
        return brandId && currentFilters.brands.includes(brandId);
      });
    }

    // Apply price filters
    if (currentFilters.minPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.base_price >= currentFilters.minPrice!,
      );
    }
    if (currentFilters.maxPrice !== undefined) {
      filtered = filtered.filter(
        (product) => product.base_price <= currentFilters.maxPrice!,
      );
    }

    // Apply stock filter
    if (currentFilters.inStockOnly) {
      filtered = filtered.filter((product) => product.inventory_quantity > 0);
    }

    // Apply sorting
    switch (currentFilters.sort) {
      case "price.asc":
        filtered.sort((a, b) => a.base_price - b.base_price);
        break;
      case "price.desc":
        filtered.sort((a, b) => b.base_price - a.base_price);
        break;
      case "name.asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name.desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "created.desc":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [allProducts, currentFilters]);

  // Update displayed products when filters change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedProducts(filteredAndSortedProducts.slice(0, itemsPerPage));
  }, [filteredAndSortedProducts, itemsPerPage]);

  // Debounced filter update function
  const debouncedUpdateFilters = useCallback(
    (newFilters: Partial<typeof currentFilters>) => {
      setPendingFilters(newFilters);
      setIsFilteringPending(true);
    },
    [],
  );

  // Apply pending filters with debounce
  useEffect(() => {
    if (!pendingFilters) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      // Merge current filters with new ones
      const updatedFilters = { ...currentFilters, ...pendingFilters };

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
      setPendingFilters(null);
      setIsFilteringPending(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pendingFilters, currentFilters, router]);

  // Immediate filter update function for non-debounced actions
  const updateFilters = (newFilters: Partial<typeof currentFilters>) => {
    const params = new URLSearchParams();

    // Merge current filters with new ones
    const updatedFilters = { ...currentFilters, ...newFilters };

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
  };

  // Load more products
  const loadMoreProducts = () => {
    setLoading(true);

    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;

      setDisplayedProducts(
        filteredAndSortedProducts.slice(startIndex, endIndex),
      );
      setCurrentPage(nextPage);
      setLoading(false);
    }, 500); // Small delay to show loading state
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    updateFilters({ sort });
  };

  // Handle filter changes with debounce
  const handleFiltersChange = (filters: Partial<typeof currentFilters>) => {
    // Immediate updates for certain filter types
    if (filters.sort || filters.inStockOnly !== undefined) {
      updateFilters(filters);
    } else {
      // Debounced updates for search, categories, brands, price
      debouncedUpdateFilters(filters);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    router.replace(window.location.pathname);
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
          <p className="text-muted-foreground mt-2" suppressHydrationWarning>
            {isFilteringPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Применяем фильтры...
              </span>
            ) : (
              `Найдено ${filteredAndSortedProducts.length} товаров`
            )}
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
          {displayedProducts.length === 0 && !loading ? (
            <EmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <Suspense fallback={<LoadingSkeletons />}>
                <ProductGrid products={displayedProducts} />
              </Suspense>

              {/* Load More Button */}
              {displayedProducts.length < filteredAndSortedProducts.length && (
                <div className="mt-12 flex items-center justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMoreProducts}
                    disabled={loading}
                    className="min-w-[200px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Загружаем...
                      </>
                    ) : (
                      <>
                        Загрузить еще (
                        {Math.min(
                          itemsPerPage,
                          filteredAndSortedProducts.length -
                            displayedProducts.length,
                        )}{" "}
                        товаров)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Results info */}
              <div
                className="mt-6 text-center text-sm text-muted-foreground"
                suppressHydrationWarning
              >
                Показано {displayedProducts.length} из{" "}
                {filteredAndSortedProducts.length} товаров
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
