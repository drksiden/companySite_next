// @/components/Catalog.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchCategories, Product, ProductCategory } from '@/lib/medusaClient';

interface CatalogProps {
  initialProducts?: Product[];
  initialCategories?: ProductCategory[];
  parentCategoryId?: string | null;
}

export function Catalog({ initialProducts = [], initialCategories = [], parentCategoryId = null }: CatalogProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Клиентский запрос выполняется только для главной страницы каталога
  const shouldFetchCategories = initialCategories.length === 0 && parentCategoryId === null;

  useEffect(() => {
    if (shouldFetchCategories) {
      setLoading(true);
      fetchCategories()
        .then(({ product_categories }) => setCategories(product_categories))
        .catch((err) => {
          console.error('Error fetching categories:', err);
          setError('Не удалось загрузить категории');
        })
        .finally(() => setLoading(false));
    }
  }, [shouldFetchCategories]);

  if (loading) return <p className="text-center text-muted-foreground py-16">Загрузка...</p>;
  if (error) return <p className="text-center text-destructive py-16">{error}</p>;

  const filteredCategories = categories.filter((cat) => cat.parent_category_id === parentCategoryId);

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {filteredCategories.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {parentCategoryId ? 'Подкатегории' : 'Каталог'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{category.description || 'Описание категории отсутствует.'}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/catalog/${category.handle}`}>Смотреть товары</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {products.length > 0 && (
        <>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">{product.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{product.description || 'Описание товара отсутствует.'}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/product/${product.handle}`}>Подробнее</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}

      {filteredCategories.length === 0 && products.length === 0 && (
        <p className="text-center text-muted-foreground">Категории и товары отсутствуют</p>
      )}
    </section>
  );
}