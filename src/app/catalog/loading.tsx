import LoadingSkeletons from "@/features/catalog/components/LoadingSkeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CatalogLoading() {
  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Top-Level Categories Skeleton */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="p-3 flex flex-col items-center justify-center gap-3 min-h-[120px]">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-8" />
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-6" />

      {/* Filters and Products Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 lg:gap-8">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:block space-y-4">
          <Card className="p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </Card>
        </div>

        {/* Products Skeleton */}
        <div className="min-w-0">
          <LoadingSkeletons count={12} />
        </div>
      </div>
    </div>
  );
}

