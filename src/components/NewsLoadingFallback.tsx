"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Это будет заглушка, отображающаяся, пока Supabase ждет данные.
export function NewsLoadingFallback() {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* News Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 animate-pulse">

          {/* Featured News Skeleton (Большой блок) */}
          <Card className="lg:row-span-2 h-full">
            <CardHeader className="p-0">
              {/* Имитация изображения/карусели */}
              <Skeleton className="h-72 lg:h-96 w-full rounded-b-none" />
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Имитация метаданных (дата/категория) */}
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              {/* Имитация заголовка */}
              <Skeleton className="h-8 w-3/4" />
              {/* Имитация описания */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              {/* Имитация кнопки */}
              <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
          </Card>

          {/* Regular News Skeletons (3 маленьких блока) */}
          <div className="space-y-4 lg:space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-6 w-11/12" />
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-10/12" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* View All Button Skeleton */}
        <div className="text-center">
            <Skeleton className="h-12 w-40 mx-auto" />
        </div>
      </div>
    </section>
  );
}