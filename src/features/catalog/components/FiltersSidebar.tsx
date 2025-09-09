"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryItem, BrandItem } from "@/lib/services/catalog";

interface FiltersSidebarProps {
  categories: CategoryItem[];
  brands: BrandItem[];
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function FiltersSidebar({
  categories,
  brands,
  onFiltersChange,
  onClearFilters,
}: FiltersSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Фильтры временно отключены для устранения проблем с отображением.
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Категории</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.slice(0, 5).map((category) => (
              <div key={category.id} className="text-sm text-muted-foreground">
                {category.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Бренды</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {brands.slice(0, 5).map((brand) => (
              <div key={brand.id} className="text-sm text-muted-foreground">
                {brand.name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
