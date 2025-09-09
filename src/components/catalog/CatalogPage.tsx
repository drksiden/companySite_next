"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Filter,
  Grid,
  List,
  Loader2,
  SlidersHorizontal,
  X,
  Star,
  Package,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  short_description?: string;
  base_price: number;
  sale_price?: number;
  final_price: number;
  is_on_sale: boolean;
  discount_percentage: number;
  formatted_price: string;
  thumbnail?: string;
  inventory_quantity: number;
  is_featured: boolean;
  brand_name?: string;
  category_name?: string;
  brands?: {
    id: string;
    name: string;
    slug: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
    path: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
  image_url?: string;
  children?: Category[];
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

interface Filters {
  search: string;
  categories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  featured: boolean;
  sortBy: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get("search") || "",
    categories:
      searchParams.get("categories")?.split(",").filter(Boolean) || [],
    brands: searchParams.get("brands")?.split(",").filter(Boolean) || [],
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 0,
    inStockOnly: searchParams.get("inStockOnly") === "true",
    featured: searchParams.get("featured") === "true",
    sortBy: searchParams.get("sortBy") || "name_asc",
  });

  // Загрузка данных каталога
  const loadCatalogData = useCallback(async () => {
    try {
      setLoading(true);

      // Строим параметры запроса
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.categories.length > 0) {
        params.append("categories", filters.categories.join(","));
      }
      if (filters.brands.length > 0) {
        params.append("brands", filters.brands.join(","));
      }
      if (filters.minPrice > 0)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice > 0)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.inStockOnly) params.append("inStockOnly", "true");
      if (filters.featured) params.append("featured", "true");

      const response = await fetch(`/api/catalog/products?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error loading catalog:", error);
      toast.error("Не удалось загрузить каталог товаров");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Загрузка справочных данных (категории, бренды)
  const loadReferenceData = useCallback(async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/admin/form-data?type=categories"),
        fetch("/api/admin/form-data?type=brands"),
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands || []);
      }
    } catch (error) {
      console.error("Error loading reference data:", error);
    }
  }, []);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Загрузка товаров при изменении фильтров
  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  // Обновление URL при изменении фильтров
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.categories.length > 0)
      params.set("categories", filters.categories.join(","));
    if (filters.brands.length > 0)
      params.set("brands", filters.brands.join(","));
    if (filters.minPrice > 0)
      params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice > 0)
      params.set("maxPrice", filters.maxPrice.toString());
    if (filters.inStockOnly) params.set("inStockOnly", "true");
    if (filters.featured) params.set("featured", "true");
    if (filters.sortBy !== "name_asc") params.set("sortBy", filters.sortBy);
    if (pagination.page > 1) params.set("page", pagination.page.toString());

    const url = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(url);
  }, [filters, pagination.page, router]);

  // Обработчики изменения фильтров
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      categories: [],
      brands: [],
      minPrice: 0,
      maxPrice: 0,
      inStockOnly: false,
      featured: false,
      sortBy: "name_asc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSearch = useCallback(
    (searchTerm: string) => {
      handleFilterChange({ search: searchTerm });
    },
    [handleFilterChange],
  );

  // Получаем активные фильтры для отображения
  const activeFiltersCount =
    filters.categories.length +
    filters.brands.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice > 0 ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0 || filters.search;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Заголовок каталога */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Каталог товаров</h1>
        <p className="text-muted-foreground">
          Найдите идеальный товар из нашего широкого ассортимента
        </p>
      </div>

      {/* Поиск и управление */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск товаров..."
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(filters.search);
              }
            }}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Фильтры
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange({ sortBy: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
              <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
              <SelectItem value="price_asc">По цене (возрастание)</SelectItem>
              <SelectItem value="price_desc">По цене (убывание)</SelectItem>
              <SelectItem value="created_desc">Сначала новые</SelectItem>
              <SelectItem value="featured">Сначала рекомендуемые</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Активные фильтры */}
      {hasActiveFilters && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Активные фильтры:</span>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Очистить все
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Поиск: "{filters.search}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange({ search: "" })}
                />
              </Badge>
            )}
            {filters.categories.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              return category ? (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {category.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      handleFilterChange({
                        categories: filters.categories.filter(
                          (id) => id !== categoryId,
                        ),
                      })
                    }
                  />
                </Badge>
              ) : null;
            })}
            {filters.brands.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return brand ? (
                <Badge
                  key={brandId}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {brand.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      handleFilterChange({
                        brands: filters.brands.filter((id) => id !== brandId),
                      })
                    }
                  />
                </Badge>
              ) : null;
            })}
            {filters.featured && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Рекомендуемые
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange({ featured: false })}
                />
              </Badge>
            )}
            {filters.inStockOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                В наличии
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange({ inStockOnly: false })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Боковая панель с фильтрами */}
        {showFilters && (
          <div className="w-80 shrink-0">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Фильтры
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Категории */}
                <div>
                  <h3 className="font-medium mb-3">Категории</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...filters.categories, category.id]
                              : filters.categories.filter(
                                  (id) => id !== category.id,
                                );
                            handleFilterChange({ categories: newCategories });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {"—".repeat(category.level)} {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Бренды */}
                <div>
                  <h3 className="font-medium mb-3">Бренды</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand.id)}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...filters.brands, brand.id]
                              : filters.brands.filter((id) => id !== brand.id);
                            handleFilterChange({ brands: newBrands });
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Цена */}
                <div>
                  <h3 className="font-medium mb-3">Цена</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="От"
                      value={filters.minPrice || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          minPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="До"
                      value={filters.maxPrice || ""}
                      onChange={(e) =>
                        handleFilterChange({
                          maxPrice: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Дополнительные фильтры */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        handleFilterChange({ inStockOnly: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Только в наличии</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) =>
                        handleFilterChange({ featured: e.target.checked })
                      }
                      className="rounded"
                    />
                    <span className="text-sm">Рекомендуемые товары</span>
                  </label>
                </div>

                {/* Кнопка очистки фильтров */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Очистить фильтры
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Основной контент */}
        <div className="flex-1">
          {/* Результаты поиска */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {loading ? "Загрузка..." : `Найдено ${pagination.total} товаров`}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Товары не найдены
                </h3>
                <p className="text-muted-foreground mb-4">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Очистить фильтры
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Список товаров */}
              <div
                className={cn(
                  "gap-6 mb-8",
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "space-y-4",
                )}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product as any}
                    variant={viewMode}
                    showWishlist={true}
                  />
                ))}
              </div>

              {/* Пагинация */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!pagination.hasPrev}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    Предыдущая
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(pagination.totalPages, 5) },
                      (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (
                          pagination.page >=
                          pagination.totalPages - 2
                        ) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === pagination.page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Следующая
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Популярные категории */}
      {!loading && !hasActiveFilters && categories.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Популярные категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories
              .filter((cat) => cat.level === 0)
              .slice(0, 6)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/catalog?categories=${category.id}`}
                  className="group"
                >
                  <Card className="transition-transform group-hover:scale-105">
                    <CardContent className="p-4 text-center">
                      {category.image_url ? (
                        <div className="relative w-16 h-16 mx-auto mb-3">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <h3 className="font-medium text-sm">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
