import { CatalogProduct } from "@/lib/services/catalog";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: CatalogProduct[];
  loading?: boolean;
}

export default function ProductGrid({
  products,
  loading = false,
}: ProductGridProps) {
  const gridClasses =
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={cn("grid gap-4", gridClasses)}>
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
    <div className={cn("grid gap-6", gridClasses)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
