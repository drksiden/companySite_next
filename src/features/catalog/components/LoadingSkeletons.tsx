"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingSkeletonsProps {
  count?: number;
  layout?: "grid" | "list";
  size?: "small" | "medium" | "large";
}

export default function LoadingSkeletons({
  count = 12,
  layout = "grid",
  size = "medium",
}: LoadingSkeletonsProps) {
  const gridClasses = {
    small: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
    medium: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    large: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  };

  if (layout === "list") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="w-full">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image skeleton */}
                <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />

                {/* Content skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Grid layout
  return (
    <div className={`grid gap-4 ${gridClasses[size]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="space-y-3">
            {/* Image skeleton */}
            <Skeleton className={
              size === "small"
                ? "aspect-square w-full"
                : size === "medium"
                ? "aspect-square w-full"
                : "aspect-[4/3] w-full"
            } />

            {/* Content skeleton */}
            <CardContent className="p-3 space-y-2">
              {size !== "small" && (
                <Skeleton className="h-3 w-16" />
              )}

              <Skeleton className={
                size === "small"
                  ? "h-4 w-full"
                  : size === "medium"
                  ? "h-4 w-full"
                  : "h-5 w-full"
              } />

              <Skeleton className="h-3 w-3/4" />

              {size === "large" && (
                <>
                  <Skeleton className="h-3 w-1/2" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-1">
                <Skeleton className={
                  size === "small" ? "h-4 w-16" : "h-5 w-20"
                } />
                <Skeleton className="h-3 w-12" />
              </div>

              {size !== "small" && (
                <Skeleton className="h-3 w-24" />
              )}
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
