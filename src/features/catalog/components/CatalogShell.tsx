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
  listProducts,
  listCategories,
  listBrands,
} from "@/lib/services/catalog";
import { Suspense } from "react";

// --------------------
// Запросы
// --------------------
async function fetchProducts() {
  try {
    const params = { page: "1", limit: "50", sort: "name.asc" };
    const productsResult = await listProducts(params);
    return productsResult.data || [];
  } catch {
    return [];
  }
}

async function fetchCategories() {
  try {
    return (await listCategories()) || [];
  } catch {
    return [];
  }
}

async function fetchBrands() {
  try {
    return (await listBrands()) || [];
  } catch {
    return [];
  }
}

async function CatalogProducts() {
  const products = await fetchProducts();

  if (!products.length) {
    return (
      <EmptyState
        title="Товары не найдены"
        description="В каталоге пока нет товаров"
        onClearFilters={() => {}}
      />
    );
  }

  return <ProductGrid products={products} />;
}

async function CategoriesCard() {
  const categories = await fetchCategories();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Категории
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {categories.slice(0, 8).map((category) => (
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
  );
}

async function BrandsCard() {
  const brands = await fetchBrands();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Бренды</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {brands.slice(0, 6).map((brand) => (
            <div key={brand.id} className="flex items-center justify-between">
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
  );
}

export default function CatalogShell() {
  return (
    <div className="container mx-auto px-4 py-8" id="catalog-top">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
        {/* Sidebar */}
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
              <Input placeholder="Поиск товаров..." className="w-full" disabled />
              <p className="text-xs text-muted-foreground mt-2">
                Поиск временно отключен
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Suspense fallback={<CardContent>Загрузка категорий...</CardContent>}>
            <CategoriesCard />
          </Suspense>

          {/* Brands */}
          <Suspense fallback={<CardContent>Загрузка брендов...</CardContent>}>
            <BrandsCard />
          </Suspense>
        </div>

        {/* Main Content */}
        <div className="min-w-0">
          <Suspense fallback={<div className="text-muted-foreground">Загрузка товаров...</div>}>
            <CatalogProducts />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
