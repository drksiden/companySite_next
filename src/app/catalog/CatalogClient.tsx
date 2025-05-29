'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductFilters } from '@/components/catalog/ProductFilters';
import { Brand, Category, Subcategory, Collection, Product } from '@/lib/types/catalog';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityCard } from '@/components/catalog/EntityCard';

export default function CatalogClient() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных при монтировании
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandsRes, categoriesRes, subcategoriesRes, collectionsRes, productsRes] = await Promise.all([
          fetch('/api/catalog?type=brands'),
          fetch('/api/catalog?type=categories'),
          fetch('/api/catalog?type=subcategories'),
          fetch('/api/catalog?type=collections'),
          fetch('/api/catalog?type=products'),
        ]);

        const [brandsData, categoriesData, subcategoriesData, collectionsData, productsData] = await Promise.all([
          brandsRes.json(),
          categoriesRes.json(),
          subcategoriesRes.json(),
          collectionsRes.json(),
          productsRes.json(),
        ]);

        setBrands(brandsData);
        setCategories(categoriesData);
        setSubcategories(subcategoriesData);
        setCollections(collectionsData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching catalog data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Загрузка отфильтрованных продуктов
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedBrandId) queryParams.set('brandId', selectedBrandId);
        if (selectedCategoryId) queryParams.set('categoryId', selectedCategoryId);
        if (selectedSubcategoryId) queryParams.set('subcategoryId', selectedSubcategoryId);
        if (selectedCollectionId) queryParams.set('collectionId', selectedCollectionId);

        const response = await fetch(`/api/catalog?type=products&${queryParams.toString()}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedBrandId, selectedCategoryId, selectedSubcategoryId, selectedCollectionId]);

  const handleFilterChange = (filters: {
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
    collectionId?: string;
  }) => {
    setSelectedBrandId(filters.brandId);
    setSelectedCategoryId(filters.categoryId);
    setSelectedSubcategoryId(filters.subcategoryId);
    setSelectedCollectionId(filters.collectionId);
  };

  if (isLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Каталог', href: '/catalog' },
          ]}
          className="mb-8"
        />
        <div className="mb-12">
          <div className="h-8 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="mb-12">
          <div className="h-8 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="mb-12">
          <div className="h-8 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[400px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
        ]}
        className="mb-8"
      />
      <h1 className="text-3xl font-bold mb-8">Каталог</h1>
      {/* Категории */}
      <div className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map(category => (
            <EntityCard
              key={category.id}
              image={category.image}
              title={category.name}
              description={category.description}
              href={`/catalog/category/${category.id}`}
            />
          ))}
        </div>
      </div>
      {/* Фильтр и товары */}
      <div className="flex flex-col gap-x-8 gap-y-10 lg:flex-row">
        <div className="w-full lg:w-64 h-full sticky top-28 self-start">
          <ProductFilters
            brands={brands}
            categories={categories}
            subcategories={subcategories}
            collections={collections}
            selectedBrandId={selectedBrandId}
            selectedCategoryId={selectedCategoryId}
            selectedSubcategoryId={selectedSubcategoryId}
            selectedCollectionId={selectedCollectionId}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length === 0 && (
            <div className="flex h-96 items-center justify-center">
              <div className="text-lg text-muted-foreground">Товары не найдены</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 