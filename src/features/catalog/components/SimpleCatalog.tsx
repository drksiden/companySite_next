"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Heart,
  ShoppingCart,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  Package,
  RefreshCw,
} from "@/components/icons/SimpleIcons";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formatPrice } from "@/utils";
import { getFirstValidImage } from "@/utils/image";
import type { SearchProductsResult, Category, Brand } from "@/types/catalog";

interface SimpleCatalogProps {
  initialProducts?: SearchProductsResult[];
  initialCategories?: Category[];
  initialBrands?: Brand[];
}

export function SimpleCatalog({
  initialProducts = [],
  initialCategories = [],
  initialBrands = [],
}: SimpleCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Состояние
  const [products, setProducts] =
    useState<SearchProductsResult[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Фильтры
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || "all",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "name_asc",
  );
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  // Загрузка продуктов
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("sortBy", sortBy);

      if (search) params.set("search", search);
      if (selectedCategory && selectedCategory !== "all")
        params.set("categories", selectedCategory);
      if (selectedBrand && selectedBrand !== "all")
        params.set("brands", selectedBrand);

      const response = await fetch(`/api/catalog/products?${params}`);

      if (!response.ok) {
        throw new Error("Ошибка загрузки товаров");
      }

      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products || data.data || []);
      } else {
        throw new Error(data.error || "Неизвестная ошибка");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, search, selectedCategory, selectedBrand]);

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, search, selectedCategory, selectedBrand]);

  // Обновление URL при изменении фильтров
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory && selectedCategory !== "all")
      params.set("category", selectedCategory);
    if (selectedBrand && selectedBrand !== "all")
      params.set("brand", selectedBrand);
    if (sortBy !== "name_asc") params.set("sortBy", sortBy);
    if (page !== 1) params.set("page", page.toString());

    const newUrl = `/catalog${params.toString() ? `?${params}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [search, selectedCategory, selectedBrand, sortBy, page, router]);

  // Обработчики
  const handleAddToCart = useCallback((product: SearchProductsResult) => {
    toast.success(`${product.name} добавлен в корзину`);
  }, []);

  const handleAddToWishlist = useCallback((product: SearchProductsResult) => {
    toast.success(`${product.name} добавлен в избранное`);
  }, []);

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("name_asc");
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог", href: "/catalog" },
        ]}
        className="mb-6"
      />

      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Каталог товаров</h1>
          <p className="text-muted-foreground mt-2">
            Найдите нужные товары в нашем каталоге
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <List className="h-4 w-4" />
            ) : (
              <Grid className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Фильтры */}
        <div
          className={cn(
            "lg:w-64 flex-shrink-0",
            showFilters ? "block" : "hidden lg:block",
          )}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Фильтры</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Очистить
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Поиск */}
              <div>
                <label className="text-sm font-medium mb-2 block">Поиск</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Найти товар..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Категории */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Категория
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Бренды */}
              <div>
                <label className="text-sm font-medium mb-2 block">Бренд</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все бренды" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все бренды</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Панель управления */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="text-sm text-muted-foreground">
              Найдено товаров: {products.length}
            </div>

            {/* Сортировка */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
                <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
                <SelectItem value="price_asc">Сначала дешевле</SelectItem>
                <SelectItem value="price_desc">Сначала дороже</SelectItem>
                <SelectItem value="created_desc">Сначала новые</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Товары */}
          {loading && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square bg-muted animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 bg-muted rounded animate-pulse w-2/3 mb-4" />
                    <div className="h-6 bg-muted rounded animate-pulse w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-destructive">
                Ошибка загрузки
              </h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchProducts}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
              <p className="text-muted-foreground mb-6">
                Попробуйте изменить параметры поиска или очистить фильтры
              </p>
              <Button variant="outline" onClick={clearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Очистить фильтры
              </Button>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {products.map((product) => (
                <ProductCardSimple
                  key={product.id}
                  product={product}
                  variant={viewMode}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Упрощенная карточка товара
interface ProductCardSimpleProps {
  product: SearchProductsResult;
  variant?: "grid" | "list";
  onAddToCart?: (product: SearchProductsResult) => void;
  onAddToWishlist?: (product: SearchProductsResult) => void;
}

function ProductCardSimple({
  product,
  variant = "grid",
  onAddToCart,
  onAddToWishlist,
}: ProductCardSimpleProps) {
  const [imageError, setImageError] = useState(false);

  const imageSrc =
    product.thumbnail ||
    (product.images && product.images[0]) ||
    "/placeholder.jpg";

  // Валидация URL изображения
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith("/");
    }
  };

  const validImageSrc = imageError
    ? "/placeholder.jpg"
    : isValidUrl(imageSrc)
      ? imageSrc
      : "/placeholder.jpg";

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product);
  };

  const currentPrice =
    product.final_price || product.sale_price || product.base_price || 0;
  const originalPrice = product.base_price;
  const hasDiscount =
    product.sale_price &&
    product.base_price &&
    product.sale_price < product.base_price;

  if (variant === "list") {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex">
          <div className="relative w-48 h-48 flex-shrink-0">
            <Image
              src={validImageSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="192px"
              unoptimized={validImageSrc.includes("r2.dev")}
              onError={handleImageError}
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {product.short_description && (
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <span className="text-2xl font-bold">
                      {formatPrice(currentPrice)}
                    </span>
                    {hasDiscount && originalPrice && (
                      <span className="text-sm text-muted-foreground line-through ml-2">
                        {formatPrice(originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {product.is_featured && (
                    <Badge variant="secondary">Популярный</Badge>
                  )}
                  {product.is_on_sale && (
                    <Badge variant="destructive">Скидка</Badge>
                  )}
                  {product.track_inventory &&
                    (product.inventory_quantity || 0) <= 0 && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200"
                      >
                        Под заказ
                      </Badge>
                    )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={handleCartClick}
                  disabled={
                    product.track_inventory &&
                    (product.inventory_quantity || 0) <= 0
                  }
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />В корзину
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWishlistClick}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Изображение */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={validImageSrc}
            alt={product.name}
            fill
            className="transition-transform duration-300 group-hover:scale-105 object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized={validImageSrc.includes("r2.dev")}
            onError={handleImageError}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_on_sale && (
            <Badge variant="destructive" className="text-xs">
              Скидка
            </Badge>
          )}
          {product.is_featured && (
            <Badge variant="secondary" className="text-xs">
              Популярный
            </Badge>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={handleWishlistClick}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0" asChild>
            <Link href={`/product/${product.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Статус наличия */}
        {product.track_inventory && (product.inventory_quantity || 0) <= 0 && (
          <div className="absolute bottom-2 left-2">
            <Badge
              variant="outline"
              className="text-xs bg-orange-50 text-orange-700 border-orange-200"
            >
              Под заказ
            </Badge>
          </div>
        )}
      </div>

      {/* Содержимое карточки */}
      <CardContent className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.short_description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg font-bold">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Футер с кнопкой */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleCartClick}
          disabled={
            product.track_inventory && (product.inventory_quantity || 0) <= 0
          }
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.track_inventory && (product.inventory_quantity || 0) <= 0
            ? "Под заказ"
            : "В корзину"}
        </Button>
      </CardFooter>
    </Card>
  );
}
