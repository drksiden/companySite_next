"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import LoadingSkeletons from "./LoadingSkeletons";
import SimpleLoadingIndicator from "./SimpleLoadingIndicator";
import { CatalogProduct } from "@/lib/services/catalog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useProducts } from "@/lib/hooks/useCatalog";
import { useQueryClient } from "@tanstack/react-query";

interface CatalogProductsProps {
  initialProducts: CatalogProduct[];
  searchParams?: {
    query?: string;
    category?: string;
    brand?: string;
  };
  useSimpleLoader?: boolean;
}

export default function CatalogProducts({
  initialProducts,
  searchParams,
  useSimpleLoader = false,
}: CatalogProductsProps) {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();

  // Memoize current filter values to prevent unnecessary re-renders
  const currentFilters = useMemo(
    () => ({
      query: params.get("query") || searchParams?.query || "",
      category: params.get("category") || searchParams?.category || "",
      brand: params.get("brand") || searchParams?.brand || "",
    }),
    [params, searchParams],
  );

  // Подготовка параметров для запроса
  const queryParams = useMemo(() => {
    const categories = currentFilters.category
      ? currentFilters.category.split(",").filter(Boolean)
      : [];
    const brands = currentFilters.brand
      ? currentFilters.brand.split(",").filter(Boolean)
      : [];

    return {
      page: 1,
      limit: 50,
      sort: "name.asc",
      search: currentFilters.query || undefined,
      categories: categories.length > 0 ? categories : undefined,
      brands: brands.length > 0 ? brands : undefined,
    };
  }, [currentFilters]);

  // Используем React Query для загрузки товаров
  const {
    data: productsData,
    isLoading,
    error: queryError,
    refetch,
    isFetching,
  } = useProducts(queryParams);

  // Устанавливаем initialData в кэш при первой загрузке
  React.useEffect(() => {
    if (initialProducts.length > 0 && !productsData && queryClient) {
      queryClient.setQueryData(
        ["catalog", "products", queryParams],
        { data: initialProducts, meta: { total: initialProducts.length, page: 1, limit: 50, totalPages: 1, hasNext: false, hasPrev: false } }
      );
    }
  }, [initialProducts.length, productsData, queryParams, queryClient]); // Только при монтировании или если нет данных

  const products = productsData?.data || initialProducts;
  const loading = isLoading || isFetching;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Unknown error") : null;

  // Clear filters function
  const clearFilters = () => {
    router.push("/catalog", { scroll: false });
  };

  // Retry function
  const retryFetch = () => {
    refetch();
  };

  // Show loading state
  if (loading) {
    if (useSimpleLoader) {
      return <SimpleLoadingIndicator message="Загрузка товаров..." />;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Загрузка товаров...</span>
          </div>
        </div>
        <LoadingSkeletons
          count={products.length > 0 ? Math.min(products.length, 12) : 8}
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Ошибка загрузки
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={retryFetch}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  // Show products or empty state
  if (products.length === 0) {
    const hasActiveFilters =
      currentFilters.query || currentFilters.category || currentFilters.brand;

    return (
      <EmptyState
        title="Товары не найдены"
        description={
          hasActiveFilters
            ? "Попробуйте изменить поисковый запрос или фильтры"
            : "В каталоге пока нет товаров"
        }
        onClearFilters={hasActiveFilters ? clearFilters : undefined}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Results info */}
      {(currentFilters.query ||
        currentFilters.category ||
        currentFilters.brand) && (
        <div className="flex items-center justify-between py-2 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {loading
              ? "Поиск товаров..."
              : `Найдено товаров: ${products.length}`}
          </span>
          {!loading && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {/* Products grid with smooth animation */}
      <div className="catalog-animate-fade-in">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
