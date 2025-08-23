import ProductGrid from "./ProductGrid";
import EmptyState from "./EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import {
  CatalogProduct,
  CategoryItem,
  BrandItem,
} from "@/lib/services/catalog";

interface CatalogShellProps {
  initialProducts: CatalogProduct[];
  initialCategories: CategoryItem[];
  initialBrands: BrandItem[];
}

export default function CatalogShell({
  initialProducts,
  initialCategories,
  initialBrands,
}: CatalogShellProps) {
  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
          <p className="text-muted-foreground mt-2">
            Найдено {initialProducts.length} товаров
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
        {/* Sidebar with Filters */}
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Поиск
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Поиск товаров..."
                className="w-full"
                disabled
              />
              <p className="text-xs text-muted-foreground mt-2">
                Поиск временно отключен
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Категории
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {initialCategories.slice(0, 8).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{category.name}</span>
                    {category.product_count && (
                      <Badge variant="secondary" className="text-xs">
                        {category.product_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Фильтры временно отключены
              </p>
            </CardContent>
          </Card>

          {/* Brands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Бренды</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {initialBrands.slice(0, 6).map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{brand.name}</span>
                    {brand.product_count && (
                      <Badge variant="secondary" className="text-xs">
                        {brand.product_count}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="min-w-0">
          {initialProducts.length === 0 ? (
            <EmptyState
              title="Товары не найдены"
              description="В каталоге пока нет товаров"
              onClearFilters={() => {}}
            />
          ) : (
            <ProductGrid products={initialProducts} />
          )}
        </div>
      </div>
    </div>
  );
}
