import { Card } from "@/components/ui/card";

interface LoadingSkeletonsProps {
  count?: number;
}

export default function LoadingSkeletons({ count = 8 }: LoadingSkeletonsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <Card
          key={index}
          className="bg-card border border-border shadow-sm rounded-lg overflow-hidden catalog-animate-fade-in product-card"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Image skeleton - matches ProductCard h-48 */}
          <div className="relative w-full h-48 bg-muted loading-shimmer rounded-t-lg"></div>

          {/* Content skeleton - matches ProductCard padding and layout */}
          <div className="p-3 space-y-2 flex-1 flex flex-col">
            {/* Brand name skeleton */}
            <div className="h-3 bg-muted loading-shimmer rounded w-1/2"></div>

            {/* Product name skeleton */}
            <div className="h-4 bg-muted loading-shimmer rounded w-4/5"></div>
            <div className="h-4 bg-muted loading-shimmer rounded w-2/3"></div>

            {/* Price skeleton */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="h-5 bg-muted loading-shimmer rounded w-1/3 mt-2"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
