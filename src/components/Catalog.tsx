'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCategories, fetchProducts } from '@/lib/medusaClient';
import type { StoreProductCategory, StoreProduct } from '@medusajs/medusa';

interface CatalogProps {
  initialProducts?: StoreProduct[];
  initialCategories?: StoreProductCategory[];
}

export function Catalog({ initialProducts = [], initialCategories = [] }: CatalogProps) {
  const [categories, setCategories] = useState<StoreProductCategory[]>(initialCategories);
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(!initialProducts.length);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount if not provided
  useEffect(() => {
    if (!categories.length) {
      fetchCategories()
        .then(({ product_categories }) => setCategories(product_categories))
        .catch(() => setError('Не удалось загрузить категории'))
        .finally(() => setLoading(false));
    }
  }, []);

  // Fetch products when category or subcategory changes
  useEffect(() => {
    setLoading(true);
    const categoryId = selectedSubcategory || selectedCategory || undefined;
    fetchProducts(categoryId)
      .then(({ products }) => setProducts(products))
      .catch(() => setError('Не удалось загрузить продукты'))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSubcategory]);

  // Extract unique manufacturers from products
  const manufacturers = Array.from(
    new Set(products.map((product) => product.metadata?.manufacturer as string).filter(Boolean))
  );

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when changing category
  };

  if (loading) return <p className="text-center text-muted-foreground py-16">Загрузка...</p>;
  if (error) return <p className="text-center text-destructive py-16">{error}</p>;

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Каталог решений</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        {/* Category Filter */}
        <Select onValueChange={handleCategoryChange} value={selectedCategory || ''}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Выберите категорию" />
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

        {/* Subcategory Filter */}
        {selectedCategory && (
          <Select onValueChange={setSelectedSubcategory} value={selectedSubcategory || ''}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите подкатегорию" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все подкатегории</SelectItem>
              {categories
                .find((cat) => cat.id === selectedCategory)
                ?.category_children?.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        {/* Manufacturer Filter */}
        {manufacturers.length > 0 && (
          <Select onValueChange={setSelectedManufacturer} value={selectedManufacturer || ''}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите производителя" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все производители</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer} value={manufacturer}>
                  {manufacturer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products
          .filter(
            (product) =>
              !selectedManufacturer ||
              selectedManufacturer === 'all' ||
              product.metadata?.manufacturer === selectedManufacturer
          )
          .map((product) => (
            <Card key={product.id} className="bg-card border-border shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">{product.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
                {product.metadata?.manufacturer && (
                  <p className="text-sm text-muted-foreground">
                    Производитель: {product.metadata.manufacturer}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 py-2"
                >
                  <Link href={`/catalog/${product.handle}`}>Подробнее</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </section>
  );
}