"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  rows?: number;
  showFilters?: boolean;
}

export function LoadingSkeleton({ rows = 5, showFilters = true }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Фильтры */}
      {showFilters && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблица */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            {/* Заголовок таблицы */}
            <div className="border-b bg-muted/50 p-3">
              <div className="grid grid-cols-8 gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Строки таблицы */}
            <div className="divide-y">
              {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="p-3">
                  <div className="grid grid-cols-8 gap-4 items-center">
                    {/* Фото */}
                    <div className="flex justify-center">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>

                    {/* Товар */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>

                    {/* Категория */}
                    <Skeleton className="h-4 w-24" />

                    {/* Бренд */}
                    <Skeleton className="h-4 w-20" />

                    {/* Цена */}
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>

                    {/* Остаток */}
                    <div className="space-y-1 text-center">
                      <Skeleton className="h-4 w-8 mx-auto" />
                      <Skeleton className="h-5 w-16 mx-auto rounded-full" />
                    </div>

                    {/* Статус */}
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>

                    {/* Действия */}
                    <div className="flex justify-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Пагинация */}
          <div className="flex items-center justify-between mt-6 p-4 bg-muted/20 rounded-lg border">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент для скелета карточки продукта
export function ProductCardSkeleton() {
  return (
    <Card className="product-card">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Компонент для скелета формы
export function FormSkeleton() {
  return (
    <div className="space-y-6 form-fade-in">
      {/* Основная информация */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Категории и цены */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Описание */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
