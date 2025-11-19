import { memo, useMemo } from "react";
import { CatalogProduct } from "@/lib/services/catalog";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProductGridProps {
  products: CatalogProduct[];
  loading?: boolean;
}

function ProductGrid({
  products,
  loading = false,
}: ProductGridProps) {
  // Улучшенные классы для адаптивного дизайна
  const gridClasses =
    "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

  // Мемоизируем список продуктов с приоритетами (должно быть до ранних возвратов)
  const productsWithPriority = useMemo(
    () => products.map((product, index) => ({
      product,
      priority: index < 8,
      delay: Math.min(index * 0.05, 0.5),
    })),
    [products]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={cn("grid gap-4 md:gap-6", gridClasses)}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="group relative h-full rounded-xl bg-[var(--card-bg)] shadow-sm animate-pulse"
            >
              {/* Product Image Skeleton */}
              <div className="relative w-full h-72 rounded-t-xl bg-[var(--image-bg)]" />
              {/* Product Content Skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-muted-foreground/30 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/30 rounded w-1/2" />
                <div className="h-5 bg-muted-foreground/30 rounded w-1/3 mt-4" />
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
        <p className="text-muted-foreground text-2xl font-semibold">
          Товары не найдены
        </p>
        <p className="text-muted-foreground mt-2">
          Попробуйте изменить параметры поиска или фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:gap-6", gridClasses)}>
      {productsWithPriority.map(({ product, priority, delay }) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay,
            ease: "easeOut",
          }}
        >
          <ProductCard 
            product={product} 
            priority={priority}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Мемоизированная версия для оптимизации производительности
export default memo(ProductGrid);
