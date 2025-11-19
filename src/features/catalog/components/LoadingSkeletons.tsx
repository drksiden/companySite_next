import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

interface LoadingSkeletonsProps {
  count?: number;
}

function LoadingSkeletons({ count = 8 }: LoadingSkeletonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
      {[...Array(count)].map((_, index) => (
        <Card
          key={index}
          className="bg-card border border-border shadow-sm rounded-lg overflow-hidden product-card"
        >
          {/* Image skeleton - matches ProductCard h-48 */}
          <Skeleton className="w-full h-48 rounded-t-lg" />

          {/* Content skeleton - matches ProductCard padding and layout */}
          <div className="p-3 space-y-2 flex-1 flex flex-col">
            {/* Brand name skeleton */}
            <Skeleton className="h-3 w-1/2" />

            {/* Product name skeleton */}
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />

            {/* Price skeleton */}
            <div className="flex-1 flex flex-col justify-end mt-2">
              <Skeleton className="h-5 w-1/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Мемоизированная версия для оптимизации
export default memo(LoadingSkeletons);
