"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductFilters } from "@/components/catalog/ProductFilters";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { QuickView } from "@/components/catalog/QuickView";
import { OptimizedImage } from "@/components/catalog/OptimizedImage";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Loader2,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  LayoutGrid,
  Rows3,
  Package,
  ShoppingBag,
  Heart,
  TrendingUp,
  Eye,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CatalogProvider, useCatalog } from "@/contexts/CatalogContext";

import type {
  Category,
  Brand,
  Collection,
  ProductListResponse,
  ProductFilters as FilterType,
  ProductSortBy,
  SearchProductsResult,
} from "@/types/catalog";

interface CatalogClientV2Props {
  initialProducts: ProductListResponse | undefined;
  initialCategories?: Category[];
  initialBrands?: Brand[];
  initialCollections?: Collection[];
}

// Компонент сетки товаров с виртуализацией
function ProductGrid({
  products,
  viewMode,
  isLoading,
  onQuickView,
  onAddToWishlist,
  onAddToCart,
}: {
  products: SearchProductsResult[];
  viewMode: "grid" | "list";
  isLoading: boolean;
  onQuickView: (product: SearchProductsResult) => void;
  onAddToWishlist: (product: SearchProductsResult) => void;
  onAddToCart: (product: SearchProductsResult) => void;
}) {
  const [visibleProducts, setVisibleProducts] = useState(products.slice(0, 12));
  const [loadMoreCount, setLoadMoreCount] = useState(12);

  // Ленивая загрузка товаров при скролле
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 1000 &&
        !isLoading &&
        visibleProducts.length < products.length
      ) {
        const nextBatch = products.slice(0, loadMoreCount + 12);
        setVisibleProducts(nextBatch);
        setLoadMoreCount((prev) => prev + 12);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [products, visibleProducts.length, loadMoreCount, isLoading]);

  // Сброс при изменении товаров
  useEffect(() => {
    setVisibleProducts(products.slice(0, 12));
    setLoadMoreCount(12);
  }, [products]);

  if (isLoading && visibleProducts.length === 0) {
    return (
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1",
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-6 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
        <p className="text-muted-foreground mb-6">
          Попробуйте изменить параметры поиска или очистить фильтры
        </p>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Очистить фильтры
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Сетка товаров */}
      <div
        className={cn(
          "grid gap-6",
          viewMode === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1",
        )}
      >
        <AnimatePresence mode="popLayout">
          {visibleProducts.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
            >
              <ProductCard
                product={product}
                variant={viewMode}
                priority={index < 4}
                showQuickView={true}
                showWishlist={true}
                onQuickView={onQuickView}
                onAddToWishlist={onAddToWishlist}
                onAddToCart={onAddToCart}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Кнопка "Загрузить ещё" */}
      {visibleProducts.length < products.length && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            disabled={isLoading}
            onClick={() => {
              const nextBatch = products.slice(0, loadMoreCount + 12);
              setVisibleProducts(nextBatch);
              setLoadMoreCount((prev) => prev + 12);
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Загрузить ещё ({products.length - visibleProducts.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

// Компонент заголовка каталога
function CatalogHeader() {
  const { state, setViewMode, toggleFilters } = useCatalog();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Каталог товаров</h1>

        {state.products.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {state.pagination.total.toLocaleString()} товаров
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Переключатель вида */}
        <div className="flex rounded-lg border p-1">
          <Button
            variant={state.viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-3"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={state.viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-3"
          >
            <Rows3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Кнопка фильтров */}
        <Button
          variant={state.showFilters ? "default" : "outline"}
          size="sm"
          onClick={toggleFilters}
          className="sm:hidden"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Фильтры
        </Button>
      </div>
    </div>
  );
}

// Компонент поиска
function SearchBar() {
  const { state, setFilters } = useCatalog();
  const [searchInput, setSearchInput] = useState(state.filters.search || "");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFilters({ search: searchInput.trim() || undefined });
    },
    [searchInput, setFilters],
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setFilters({ search: undefined });
  }, [setFilters]);

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Поиск товаров..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="pl-10 pr-10"
      />
      {searchInput && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}

// Компонент сортировки
function SortSelect() {
  const { state, setSort } = useCatalog();

  const sortOptions = [
    { value: "name_asc", label: "По названию (А-Я)" },
    { value: "name_desc", label: "По названию (Я-А)" },
    { value: "price_asc", label: "По цене (возрастанию)" },
    { value: "price_desc", label: "По цене (убыванию)" },
    { value: "created_desc", label: "Сначала новые" },
    { value: "created_asc", label: "Сначала старые" },
    { value: "featured", label: "Сначала популярные" },
  ] as const;

  return (
    <Select value={state.sortBy} onValueChange={setSort}>
      <SelectTrigger className="w-48">
        <ArrowUpDown className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Компонент активных фильтров
function ActiveFilters() {
  const { state, setFilters, clearFilters } = useCatalog();

  const activeFiltersList = useMemo(() => {
    const filters = [];

    if (state.filters.search) {
      filters.push({
        type: "search",
        label: `"${state.filters.search}"`,
        onRemove: () => setFilters({ search: undefined }),
      });
    }

    state.filters.categories?.forEach((categoryId) => {
      filters.push({
        type: "category",
        label: `Категория: ${categoryId}`,
        onRemove: () =>
          setFilters({
            categories: state.filters.categories?.filter(
              (id) => id !== categoryId,
            ),
          }),
      });
    });

    state.filters.brands?.forEach((brandId) => {
      filters.push({
        type: "brand",
        label: `Бренд: ${brandId}`,
        onRemove: () =>
          setFilters({
            brands: state.filters.brands?.filter((id) => id !== brandId),
          }),
      });
    });

    if (state.filters.inStockOnly) {
      filters.push({
        type: "stock",
        label: "Только в наличии",
        onRemove: () => setFilters({ inStockOnly: false }),
      });
    }

    if (state.filters.featured) {
      filters.push({
        type: "featured",
        label: "Популярные",
        onRemove: () => setFilters({ featured: false }),
      });
    }

    if (
      state.filters.priceRange &&
      (state.filters.priceRange.min > 0 || state.filters.priceRange.max > 0)
    ) {
      const { min, max } = state.filters.priceRange;
      const label =
        min > 0 && max > 0
          ? `Цена: ${min.toLocaleString()} - ${max.toLocaleString()} ₸`
          : min > 0
            ? `От: ${min.toLocaleString()} ₸`
            : `До: ${max.toLocaleString()} ₸`;

      filters.push({
        type: "price",
        label,
        onRemove: () => setFilters({ priceRange: { min: 0, max: 0 } }),
      });
    }

    return filters;
  }, [state.filters, setFilters]);

  if (activeFiltersList.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Активные фильтры:</span>

      {activeFiltersList.map((filter, index) => (
        <Badge
          key={`${filter.type}-${index}`}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          {filter.label}
          <Button
            variant="ghost"
            size="sm"
            onClick={filter.onRemove}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      {activeFiltersList.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-xs"
        >
          Очистить все
        </Button>
      )}
    </div>
  );
}

// Компонент пагинации
function Pagination() {
  const { state, setPage, prefetchPage } = useCatalog();
  const { pagination } = state;

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page);

      // Предзагружаем соседние страницы
      if (page > 1) prefetchPage(page - 1);
      if (page < pagination.totalPages) prefetchPage(page + 1);

      // Скроллим наверх
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setPage, prefetchPage, pagination.totalPages],
  );

  if (pagination.totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 7;
  const currentPage = pagination.page;

  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(
    pagination.totalPages,
    startPage + maxVisiblePages - 1,
  );

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Добавляем первую страницу
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) pages.push("...");
  }

  // Добавляем видимые страницы
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Добавляем последнюю страницу
  if (endPage < pagination.totalPages) {
    if (endPage < pagination.totalPages - 1) pages.push("...");
    pages.push(pagination.totalPages);
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasPrev}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Назад
      </Button>

      {pages.map((page, index) => (
        <Button
          key={index}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          disabled={page === "..."}
          onClick={() => typeof page === "number" && handlePageChange(page)}
          className={cn(
            typeof page === "number" ? "min-w-[40px]" : "cursor-default",
            page === "..." && "pointer-events-none",
          )}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={!pagination.hasNext}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Далее
      </Button>
    </div>
  );
}

// Компонент статистики каталога
function CatalogStats() {
  const { state } = useCatalog();

  const stats = useMemo(() => {
    const inStock = state.products.filter((p) =>
      p.track_inventory ? (p.inventory_quantity || 0) > 0 : true,
    ).length;

    const outOfStock = state.products.length - inStock;
    const featured = state.products.filter((p) => p.is_featured).length;
    const onSale = state.products.filter((p) => p.is_on_sale).length;

    return { inStock, outOfStock, featured, onSale };
  }, [state.products]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">В наличии</p>
            <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
          </div>
          <Package className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Под заказ</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.outOfStock}
            </p>
          </div>
          <Clock className="h-8 w-8 text-orange-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Популярные</p>
            <p className="text-2xl font-bold text-blue-600">{stats.featured}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Со скидкой</p>
            <p className="text-2xl font-bold text-red-600">{stats.onSale}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-red-600" />
        </div>
      </Card>
    </div>
  );
}

// Основной компонент CatalogClient V2
function CatalogClientCore() {
  const { state, fetchProducts, addToWishlist, addToCart, setFilters } =
    useCatalog();

  const [quickViewProduct, setQuickViewProduct] =
    useState<SearchProductsResult | null>(null);

  // Обработчики действий
  const handleQuickView = useCallback((product: SearchProductsResult) => {
    setQuickViewProduct(product);
  }, []);

  const handleAddToWishlist = useCallback(
    (product: SearchProductsResult) => {
      addToWishlist(product.id);
      toast.success(`${product.name} добавлен в избранное`);
    },
    [addToWishlist],
  );

  const handleAddToCart = useCallback(
    (product: SearchProductsResult) => {
      addToCart(product.id, 1);
      toast.success(`${product.name} добавлен в корзину`);
    },
    [addToCart],
  );

  // Перезагрузка при изменении фильтров
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      <CatalogHeader />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Боковая панель с фильтрами */}
        <div
          className={cn(
            "lg:w-64 flex-shrink-0",
            state.showFilters ? "block" : "hidden lg:block",
          )}
        >
          <div className="sticky top-4 space-y-6">
            {/* Поиск */}
            <div>
              <h3 className="font-medium mb-3">Поиск</h3>
              <SearchBar />
            </div>

            {/* Фильтры */}
            <ProductFilters
              categories={state.categories}
              brands={state.brands}
              collections={state.collections}
              filters={state.filters}
              onFiltersChange={(filters) => {
                // Объединяем с существующими фильтрами
                setFilters(filters);
              }}
            />
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 min-w-0">
          {/* Панель управления */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Активные фильтры */}
            <div className="flex-1">
              <ActiveFilters />
            </div>

            {/* Сортировка */}
            <SortSelect />
          </div>

          {/* Сетка товаров */}
          <ProductGrid
            products={state.products}
            viewMode={state.viewMode}
            isLoading={state.isLoading}
            onQuickView={handleQuickView}
            onAddToWishlist={handleAddToWishlist}
            onAddToCart={handleAddToCart}
          />

          {/* Пагинация */}
          <Pagination />
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
      />

      {/* Error Toast */}
      {state.error && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <p className="font-medium text-destructive">Ошибка загрузки</p>
                <p className="text-sm text-muted-foreground">{state.error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchProducts()}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Главный экспортируемый компонент
export default function CatalogClientV2({
  initialProducts,
  initialCategories = [],
  initialBrands = [],
  initialCollections = [],
}: CatalogClientV2Props) {
  return (
    <CatalogProvider
      initialData={{
        products: initialProducts,
        categories: initialCategories,
        brands: initialBrands,
        collections: initialCollections,
      }}
    >
      <CatalogClientCore />
    </CatalogProvider>
  );
}

// Экспорт дополнительных компонентов для использования отдельно
export {
  ProductGrid,
  CatalogHeader,
  SearchBar,
  SortSelect,
  ActiveFilters,
  Pagination,
  CatalogStats,
};
