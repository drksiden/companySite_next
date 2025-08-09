"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { QuickView } from "@/components/catalog/QuickView";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  LayoutGrid,
  Rows3,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type {
  Category,
  Brand,
  Collection,
  ProductListResponse,
  ProductFilters as FilterType,
  ProductSortBy,
  SearchProductsResult,
} from "@/types/catalog";

interface CatalogClientProps {
  initialProducts: ProductListResponse | null;
  initialCategories?: Category[];
  initialBrands?: Brand[];
  initialCollections?: Collection[];
}

export default function CatalogClient({
  initialProducts,
  initialCategories = [],
  initialBrands = [],
  initialCollections = [],
}: CatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Core data state
  const [productData, setProductData] = useState<ProductListResponse | null>(
    initialProducts,
  );
  const [categories] = useState<Category[]>(initialCategories);
  const [brands] = useState<Brand[]>(initialBrands);
  const [collections] = useState<Collection[]>(initialCollections);

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [quickViewProduct, setQuickViewProduct] =
    useState<SearchProductsResult | null>(null);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  // Active filters from URL
  const activeFilters: FilterType = useMemo(
    () => ({
      search: searchParams.get("search") || undefined,
      categories:
        searchParams.get("categories")?.split(",").filter(Boolean) || [],
      brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
      collections:
        searchParams.get("collections")?.split(",").filter(Boolean) || [],
      inStockOnly: searchParams.get("inStockOnly") === "true",
      featured: searchParams.get("featured") === "true",
      priceRange: {
        min: Number(searchParams.get("minPrice")) || 0,
        max: Number(searchParams.get("maxPrice")) || 0,
      },
    }),
    [searchParams],
  );

  const sortBy: ProductSortBy =
    (searchParams.get("sortBy") as ProductSortBy) || "name_asc";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(newParams)) {
        if (value === undefined || value === "" || value === 0) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      // Reset to first page when filters change
      if (Object.keys(newParams).some((key) => key !== "page")) {
        params.delete("page");
      }

      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl);
    },
    [searchParams, pathname, router],
  );

  const handleSearch = useCallback(
    (query: string) => {
      updateUrl({ search: query });
    },
    [updateUrl],
  );

  const handleFiltersChange = useCallback(
    (filters: FilterType) => {
      updateUrl({
        categories: filters.categories?.join(","),
        brands: filters.brands?.join(","),
        collections: filters.collections?.join(","),
        minPrice: filters.priceRange?.min || undefined,
        maxPrice: filters.priceRange?.max || undefined,
        inStockOnly: filters.inStockOnly ? "true" : undefined,
        featured: filters.featured ? "true" : undefined,
      });
    },
    [updateUrl],
  );

  const handleSortChange = useCallback(
    (newSortBy: ProductSortBy) => {
      updateUrl({ sortBy: newSortBy });
    },
    [updateUrl],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateUrl({ page });
    },
    [updateUrl],
  );

  const clearAllFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const handleAddToWishlist = useCallback((product: SearchProductsResult) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(product.slug)) {
        newSet.delete(product.slug);
        toast.success("Товар удален из избранного");
      } else {
        newSet.add(product.slug);
        toast.success("Товар добавлен в избранное");
      }
      return newSet;
    });
  }, []);

  const handleAddToCart = useCallback((product: SearchProductsResult) => {
    toast.success(`Товар "${product.name}" добавлен в корзину`);
  }, []);

  const products = productData?.products || [];
  const totalProducts = productData?.pagination?.total || 0;
  const totalPages = productData?.pagination?.totalPages || 1;
  const hasProducts = products.length > 0;

  const activeFiltersCount =
    (activeFilters.categories?.length || 0) +
    (activeFilters.brands?.length || 0) +
    (activeFilters.collections?.length || 0) +
    (activeFilters.inStockOnly ? 1 : 0) +
    (activeFilters.featured ? 1 : 0) +
    ((activeFilters.priceRange?.min || 0) > 0 ? 1 : 0) +
    ((activeFilters.priceRange?.max || 0) > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  // Loading state for fetching products
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (activeFilters.search) params.set("search", activeFilters.search);
      if (activeFilters.categories?.length)
        params.set("categories", activeFilters.categories.join(","));
      if (activeFilters.brands?.length)
        params.set("brands", activeFilters.brands.join(","));
      if (activeFilters.collections?.length)
        params.set("collections", activeFilters.collections.join(","));
      if (activeFilters.priceRange?.min)
        params.set("minPrice", activeFilters.priceRange.min.toString());
      if (activeFilters.priceRange?.max)
        params.set("maxPrice", activeFilters.priceRange.max.toString());
      if (activeFilters.inStockOnly) params.set("inStockOnly", "true");
      if (activeFilters.featured) params.set("featured", "true");
      if (sortBy) params.set("sortBy", sortBy);
      if (currentPage > 1) params.set("page", currentPage.toString());

      const response = await fetch(
        `/api/catalog/products?${params.toString()}`,
      );
      const data = await response.json();

      if (data.success) {
        setProductData(data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        searchParams.toString() !==
        new URLSearchParams(window.location.search).toString()
      ) {
        fetchProducts();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="lg:sticky lg:top-4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-between"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Фильтры
                  {hasActiveFilters && (
                    <Badge variant="secondary">{activeFiltersCount}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAllFilters();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Очистить
                    </Button>
                  )}
                </div>
              </Button>
            </div>

            {/* Filters */}
            <div className={cn("lg:block", showFilters ? "block" : "hidden")}>
              <ProductFilters
                filters={activeFilters}
                categories={categories}
                brands={brands}
                collections={collections}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Каталог товаров
              </h1>
              <p className="text-gray-600 mt-1">
                {totalProducts > 0
                  ? `Найдено ${totalProducts} товаров`
                  : "Товары не найдены"}
              </p>
            </div>

            {/* Search and Sort */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Поиск товаров..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(searchInput);
                    }
                  }}
                  className="pl-10 w-full sm:w-64"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
                  <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
                  <SelectItem value="price_asc">По цене (возр.)</SelectItem>
                  <SelectItem value="price_desc">По цене (убыв.)</SelectItem>
                  <SelectItem value="created_desc">Сначала новые</SelectItem>
                  <SelectItem value="featured">Рекомендуемые</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <Rows3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  Активные фильтры ({activeFiltersCount})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3 mr-1" />
                  Очистить все
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Поиск: {searchQuery}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleSearch("")}
                    />
                  </Badge>
                )}

                {activeFilters.inStockOnly && (
                  <Badge variant="secondary" className="text-xs">
                    В наличии
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() =>
                        handleFiltersChange({
                          ...activeFilters,
                          inStockOnly: false,
                        })
                      }
                    />
                  </Badge>
                )}

                {activeFilters.featured && (
                  <Badge variant="secondary" className="text-xs">
                    Рекомендуемые
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() =>
                        handleFiltersChange({
                          ...activeFilters,
                          featured: false,
                        })
                      }
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Загрузка товаров...</span>
            </div>
          ) : hasProducts ? (
            <>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4",
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    variant={viewMode}
                    showQuickView={true}
                    showWishlist={true}
                    onQuickView={setQuickViewProduct}
                    onAddToWishlist={handleAddToWishlist}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Назад
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}

                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={
                            currentPage === totalPages ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-10"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Далее
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Товары не найдены
              </h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или фильтры
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Сбросить фильтры
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}
    </div>
  );
}
