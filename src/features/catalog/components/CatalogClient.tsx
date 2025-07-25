"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import type {
  Category,
  Brand,
  Collection,
  ProductListResponse,
  ProductFilters as FilterType,
  ProductSortBy,
  CategoryFilter,
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

  // Данные, полученные с сервера
  const [productData, setProductData] = useState<ProductListResponse | null>(
    initialProducts,
  );
  const [categories] = useState<Category[]>(initialCategories);
  const [brands] = useState<Brand[]>(initialBrands);
  const [collections] = useState<Collection[]>(initialCollections);

  // Состояние UI, управляемое на клиенте
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  // Состояние фильтров и поиска, синхронизированное с URL
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
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      }
      // Сбрасываем страницу при изменении фильтров
      if (!("page" in newParams)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const handleSearch = (query: string) => {
    updateUrl({ search: query });
  };

  const handleFiltersChange = useCallback(
    async (newFilters: FilterType) => {
      setIsLoading(true);

      try {
        // Сначала обновляем URL
        updateUrl({
          categories: newFilters.categories?.length
            ? newFilters.categories?.join(",")
            : undefined,
          brands: newFilters.brands?.length
            ? newFilters.brands?.join(",")
            : undefined,
          collections: newFilters.collections?.length
            ? newFilters.collections?.join(",")
            : undefined,
          inStockOnly: newFilters.inStockOnly ? "true" : undefined,
          featured: newFilters.featured ? "true" : undefined,
          minPrice: newFilters.priceRange?.min || undefined,
          maxPrice: newFilters.priceRange?.max || undefined,
        });

        // Затем загружаем новые данные
        const response = await fetch(
          "/api/catalog/products?" +
            new URLSearchParams({
              ...(newFilters.categories?.length && {
                categories: newFilters.categories.join(","),
              }),
              ...(newFilters.brands?.length && {
                brands: newFilters.brands.join(","),
              }),
              ...(newFilters.collections?.length && {
                collections: newFilters.collections.join(","),
              }),
              ...(newFilters.inStockOnly && { inStockOnly: "true" }),
              ...(newFilters.featured && { featured: "true" }),
              ...(newFilters.priceRange?.min && {
                minPrice: newFilters.priceRange.min.toString(),
              }),
              ...(newFilters.priceRange?.max && {
                maxPrice: newFilters.priceRange.max.toString(),
              }),
              ...(newFilters.search && { search: newFilters.search }),
              sortBy,
              page: "1", // Сбрасываем на первую страницу при изменении фильтров
              limit: "20",
            }).toString(),
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProductData(result.data);
          }
        }
      } catch (error) {
        console.error("Error applying filters:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [updateUrl, sortBy],
  );

  const handleSortChange = (newSortBy: ProductSortBy) => {
    updateUrl({ sortBy: newSortBy });
  };

  const handlePageChange = useCallback(
    async (page: number) => {
      setIsLoading(true);
      updateUrl({ page });

      try {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());

        const response = await fetch(
          "/api/catalog/products?" + params.toString(),
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setProductData(result.data);
          }
        }
      } catch (error) {
        console.error("Error changing page:", error);
      } finally {
        setIsLoading(false);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateUrl, searchParams],
  );

  const clearAllFilters = useCallback(async () => {
    setIsLoading(true);
    router.push(pathname, { scroll: false });

    try {
      const response = await fetch("/api/catalog/products?limit=20");
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setProductData(result.data);
        }
      }
    } catch (error) {
      console.error("Error clearing filters:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  const hasActiveFilters = Object.values(activeFilters).some((value) =>
    Array.isArray(value) ? value.length > 0 : !!value,
  );

  const showCategories = !hasActiveFilters && categories.length > 0;
  const showProducts = productData?.products.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
        ]}
        className="mb-8"
      />

      {!showProducts && !hasActiveFilters && (
        <div className="mb-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              В каталоге пока нет товаров.
              <a
                href="/test-catalog/add-test-data"
                className="ml-1 underline text-blue-600 hover:text-blue-800"
              >
                Добавить тестовые данные
              </a>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Каталог</h1>
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск товаров..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10 w-80"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="lg:hidden mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск товаров..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10"
          />
        </div>
      </div>

      {showCategories && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Категории</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                showProductCount={true}
                className="h-32"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24">
            <Button
              variant="outline"
              className="lg:hidden w-full mb-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </Button>
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <ProductFilters
                categories={categories}
                brands={brands}
                collections={collections}
                categoryFilters={[]} // TODO: Load category filters
                activeFilters={activeFilters}
                onFilterChange={handleFiltersChange}
              />
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full mt-4"
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Загрузка...</span>
            </div>
          )}

          {!isLoading && showProducts > 0 && (
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {productData
                  ? `Найдено ${productData.pagination.total} товаров`
                  : "Товары не найдены"}
              </div>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  handleSortChange(value as ProductSortBy)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
                  <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
                  <SelectItem value="price_asc">
                    По цене (возрастание)
                  </SelectItem>
                  <SelectItem value="price_desc">По цене (убывание)</SelectItem>
                  <SelectItem value="created_desc">Сначала новые</SelectItem>
                  <SelectItem value="created_asc">Сначала старые</SelectItem>
                  <SelectItem value="featured">Рекомендуемые</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isLoading && productData?.products.length ? (
            <>
              <div
                className={`grid gap-6 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}
              >
                {productData.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant={viewMode}
                    showQuickView={true}
                    showWishlist={true}
                  />
                ))}
              </div>

              {productData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-2">
                  <Button
                    variant="outline"
                    disabled={!productData.pagination.hasPrev || isLoading}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Предыдущая
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(5, productData.pagination.totalPages),
                      },
                      (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const pageNum = startPage + i;
                        if (pageNum > productData.pagination.totalPages)
                          return null;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>
                  <Button
                    variant="outline"
                    disabled={!productData.pagination.hasNext || isLoading}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Следующая
                    {isLoading ? (
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : null}
                  </Button>
                </div>
              )}
            </>
          ) : !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {hasActiveFilters
                  ? "Попробуйте изменить параметры поиска или сбросить фильтры"
                  : "В данной категории пока нет товаров"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Сбросить фильтры
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Добавляем эффект для синхронизации поиска с URL
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);
}
