"use client";

import { useState } from "react";
import { CatalogProduct } from "@/lib/services/catalog";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Grid3X3, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: CatalogProduct[];
  loading?: boolean;
}

type ViewMode = "grid" | "list";
type GridSize = "small" | "medium" | "large";

export default function ProductGrid({ products, loading = false }: ProductGridProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [gridSize, setGridSize] = useState<GridSize>("medium");

  const gridClasses = {
    small: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
    medium: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  const cardSizes = {
    small: "small",
    medium: "medium",
    large: "large",
  } as const;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-9 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className={cn("grid gap-4", gridClasses[gridSize])}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square bg-muted animate-pulse rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-5 bg-muted animate-pulse rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Товары не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {products.length} товаров
        </p>

        <div className="flex items-center gap-2">
          {/* Grid Size Selector */}
          {viewMode === "grid" && (
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={gridSize === "small" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setGridSize("small")}
                className="px-2"
              >
                <Grid3X3 className="h-3 w-3" />
              </Button>
              <Button
                variant={gridSize === "medium" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setGridSize("medium")}
                className="px-2"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={gridSize === "large" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setGridSize("large")}
                className="px-2"
              >
                <Grid3X3 className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-2"
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product Grid/List */}
      {viewMode === "grid" ? (
        <div className={cn("grid gap-4", gridClasses[gridSize])}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size={cardSizes[gridSize]}
              layout="grid"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              size="large"
              layout="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
