"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import LoadingSkeletons from "./LoadingSkeletons";
import SimpleLoadingIndicator from "./SimpleLoadingIndicator";
import { CatalogProduct } from "@/lib/services/catalog";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

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
  const [products, setProducts] = useState<CatalogProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize current filter values to prevent unnecessary re-renders
  const currentFilters = useMemo(
    () => ({
      query: params.get("query") || "",
      category: params.get("category") || "",
      brand: params.get("brand") || "",
    }),
    [params],
  );

  // Track if this is the first load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch products function
  const fetchProducts = useCallback(async (filters: typeof currentFilters) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.set("type", "products");
      queryParams.set("page", "1");
      queryParams.set("limit", "50");
      queryParams.set("sort", "name.asc");

      if (filters.query) queryParams.set("search", filters.query);
      if (filters.category) queryParams.set("category", filters.category);
      if (filters.brand) queryParams.set("brand", filters.brand);

      const apiUrl = `/api/catalog?${queryParams.toString()}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      if (result.success) {
        setProducts(result.data || []);
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch products when filters change
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }

    // Check if we have any active filters
    const hasActiveFilters =
      currentFilters.query || currentFilters.category || currentFilters.brand;

    if (hasActiveFilters) {
      fetchProducts(currentFilters);
    } else {
      // No filters, show initial products
      setProducts(initialProducts);
    }
  }, [currentFilters, fetchProducts, initialProducts, isInitialLoad]);

  // Clear filters function
  const clearFilters = useCallback(() => {
    setProducts(initialProducts);
    router.push("/catalog", { scroll: false });
  }, [router, initialProducts]);

  // Retry function
  const retryFetch = useCallback(() => {
    fetchProducts(currentFilters);
  }, [fetchProducts, currentFilters]);

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
        <LoadingSkeletons count={products.length || 8} />
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
