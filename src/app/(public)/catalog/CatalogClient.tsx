// src/app/catalog/CatalogClient.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { CategoryCard } from '@/components/catalog/CategoryCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Grid, List, AlertTriangle } from 'lucide-react';
import type {
  Category,
  Brand,
  Collection,
  ProductListResponse,
  ProductFilters as FilterType,
  ProductSortBy,
  CategoryFilter
} from '@/types/catalog';

interface CatalogClientProps {
  initialCategories?: Category[];
  initialBrands?: Brand[];
  initialCollections?: Collection[];
}

export default function CatalogClient({ 
  initialCategories = [],
  initialBrands = [],
  initialCollections = []
}: CatalogClientProps) {
  const searchParams = useSearchParams();
  
  // Состояние данных
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [productData, setProductData] = useState<ProductListResponse | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);
  
  // Состояние загрузки и ошибок
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Состояние фильтров и поиска
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeFilters, setActiveFilters] = useState<FilterType>({
    search: searchParams.get('search') || undefined,
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    collections: searchParams.get('collections')?.split(',').filter(Boolean) || [],
    inStockOnly: searchParams.get('inStockOnly') === 'true',
    featured: searchParams.get('featured') === 'true'
  });
  const [sortBy, setSortBy] = useState<ProductSortBy>(
    (searchParams.get('sortBy') as ProductSortBy) || 'name_asc'
  );
  
  // Состояние UI
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  );

  // ==============================================
  // ЗАГРУЗКА НАЧАЛЬНЫХ ДАННЫХ
  // ==============================================

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requests = [];

      // Загружаем категории если не переданы
      if (initialCategories.length === 0) {
        requests.push(
          fetch('/api/catalog?action=categories')
            .then(res => res.json())
            .then(data => data.success ? setCategories(data.data) : [])
        );
      }

      // Загружаем бренды если не переданы
      if (initialBrands.length === 0) {
        requests.push(
          fetch('/api/catalog?action=brands')
            .then(res => res.json())
            .then(data => data.success ? setBrands(data.data) : [])
        );
      }

      // Загружаем коллекции если не переданы
      if (initialCollections.length === 0) {
        requests.push(
          fetch('/api/catalog?action=collections')
            .then(res => res.json())
            .then(data => data.success ? setCollections(data.data) : [])
        );
      }

      await Promise.all(requests);
      console.log('✅ Initial catalog data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      setError('Не удалось загрузить данные каталога');
    } finally {
      setIsLoading(false);
    }
  }, [initialCategories.length, initialBrands.length, initialCollections.length]);

  // ==============================================
  // ЗАГРУЗКА ПРОДУКТОВ
  // ==============================================

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('action', 'products');
      params.set('page', currentPage.toString());
      params.set('limit', '20');
      params.set('sortBy', sortBy);

      // Добавляем фильтры
      if (activeFilters.search) {
        params.set('search', activeFilters.search);
      }
      if (activeFilters.categories?.length) {
        params.set('categories', activeFilters.categories.join(','));
      }
      if (activeFilters.brands?.length) {
        params.set('brands', activeFilters.brands.join(','));
      }
      if (activeFilters.collections?.length) {
        params.set('collections', activeFilters.collections.join(','));
      }
      if (activeFilters.inStockOnly) {
        params.set('inStockOnly', 'true');
      }
      if (activeFilters.featured) {
        params.set('featured', 'true');
      }
      if (activeFilters.priceRange) {
        if (activeFilters.priceRange.min > 0) {
          params.set('minPrice', activeFilters.priceRange.min.toString());
        }
        if (activeFilters.priceRange.max > 0) {
          params.set('maxPrice', activeFilters.priceRange.max.toString());
        }
      }

      console.log('🔍 Loading products with params:', params.toString());

      const response = await fetch(`/api/catalog?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ошибка загрузки продуктов');
      }

      setProductData(data.data);
      console.log('✅ Products loaded:', data.data.products.length, 'items');
    } catch (error) {
      console.error('❌ Error loading products:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки продуктов');
      setProductData(null);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeFilters, sortBy, currentPage]);

  // ==============================================
  // ЗАГРУЗКА ФИЛЬТРОВ КАТЕГОРИИ
  // ==============================================

  const loadCategoryFilters = useCallback(async (categoryId: string) => {
    try {
      const response = await fetch(`/api/catalog?action=category-filters&categoryId=${categoryId}`);
      const data = await response.json();

      if (data.success) {
        setCategoryFilters(data.data);
      }
    } catch (error) {
      console.error('Error loading category filters:', error);
    }
  }, []);

  // ==============================================
  // ЭФФЕКТЫ
  // ==============================================

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Загружаем фильтры для первой выбранной категории
  useEffect(() => {
    if (activeFilters.categories?.[0]) {
      loadCategoryFilters(activeFilters.categories[0]);
    } else {
      setCategoryFilters([]);
    }
  }, [activeFilters.categories, loadCategoryFilters]);

  // ==============================================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ==============================================

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveFilters(prev => ({ ...prev, search: query || undefined }));
    setCurrentPage(1);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterType) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy: ProductSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
    setSortBy('name_asc');
    setCurrentPage(1);
  }, []);

  // ==============================================
  // УСЛОВИЯ ОТОБРАЖЕНИЯ
  // ==============================================

  const hasActiveFilters = Object.values(activeFilters).some(value => 
    Array.isArray(value) ? value.length > 0 : !!value
  );

  const showCategories = !hasActiveFilters && categories.length > 0;
  const showProducts = productData?.products.length || 0;

  // ==============================================
  // ЗАГРУЗОЧНОЕ СОСТОЯНИЕ
  // ==============================================

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
          ]}
          className="mb-8"
        />
        
        {/* Скелетон для категорий */}
        <div className="mb-12">
          <div className="h-8 w-40 bg-muted rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Скелетон для продуктов */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ==============================================
  // ОСНОВНОЙ ИНТЕРФЕЙС
  // ==============================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
      {/* Хлебные крошки */}
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
        ]}
        className="mb-8"
      />

      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Каталог</h1>
        
        {/* Поиск и переключатели вида (на мобильных скрыты) */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Мобильный поиск */}
      <div className="lg:hidden mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadProducts()}
              className="ml-4"
            >
              Попробовать снова
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Категории (показываем если нет активных фильтров) */}
      {showCategories && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Категории</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                showProductCount={true}
                className="h-32"
              />
            ))}
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Фильтры */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24">
            {/* Кнопка фильтров на мобильных */}
            <Button
              variant="outline"
              className="lg:hidden w-full mb-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Фильтры
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </Button>

            {/* Панель фильтров */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <ProductFilters
                categories={categories}
                brands={brands}
                collections={collections}
                categoryFilters={categoryFilters}
                activeFilters={activeFilters}
                onFiltersChange={handleFiltersChange}
              />
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full mt-4"
                >
                  Сбросить фильтры
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Список продуктов */}
        <div className="flex-1">
          {/* Панель управления */}
          {(showProducts > 0 || isLoadingProducts) && (
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted-foreground">
                {isLoadingProducts ? (
                  'Загрузка...'
                ) : productData ? (
                  `Найдено ${productData.pagination.total} товаров`
                ) : (
                  'Товары не найдены'
                )}
              </div>
              
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name_asc">По названию (А-Я)</SelectItem>
                  <SelectItem value="name_desc">По названию (Я-А)</SelectItem>
                  <SelectItem value="price_asc">По цене (возрастание)</SelectItem>
                  <SelectItem value="price_desc">По цене (убывание)</SelectItem>
                  <SelectItem value="created_desc">Сначала новые</SelectItem>
                  <SelectItem value="created_asc">Сначала старые</SelectItem>
                  <SelectItem value="featured">Рекомендуемые</SelectItem>
                  <SelectItem value="popularity">Популярные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Список продуктов */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full" />
              ))}
            </div>
          ) : productData?.products.length ? (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {productData.products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                    variant={viewMode}
                    showQuickView={true}
                    showWishlist={true}
                  />
                ))}
              </div>

              {/* Пагинация */}
              {productData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center mt-12 gap-2">
                  <Button
                    variant="outline"
                    disabled={!productData.pagination.hasPrev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Предыдущая
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Показываем страницы */}
                    {Array.from({ length: Math.min(5, productData.pagination.totalPages) }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2);
                      const pageNum = startPage + i;
                      
                      if (pageNum > productData.pagination.totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={!productData.pagination.hasNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Следующая
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Товары не найдены</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                {hasActiveFilters 
                  ? 'Попробуйте изменить параметры поиска или сбросить фильтры'
                  : 'В данной категории пока нет товаров'
                }
              </p>
              {hasActiveFilters && (
                <Button onClick={clearAllFilters}>
                  Сбросить фильтры
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}