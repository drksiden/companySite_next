"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX, Package, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16 px-8">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="text-2xl font-semibold text-center mb-2">
            Товары не найдены
          </h2>

          <p className="text-muted-foreground text-center mb-6 max-w-md">
            По выбранным фильтрам товары не найдены. Попробуйте изменить критерии поиска или очистить фильтры.
          </p>

          <div className="flex gap-3">
            <Button onClick={onClearFilters} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Сбросить фильтры
            </Button>
            <Button asChild>
              <a href="/catalog">
                Все товары
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2">
          Каталог пуст
        </h2>

        <p className="text-muted-foreground text-center mb-6 max-w-md">
          В настоящее время в каталоге нет товаров. Мы работаем над пополнением ассортимента.
        </p>

        <Button asChild>
          <a href="/">
            На главную
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
