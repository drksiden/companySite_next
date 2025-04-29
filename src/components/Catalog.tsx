'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCategories, Product, ProductCategory } from '@/lib/medusaClient';

interface CatalogProps {
  initialProducts?: Product[];
  initialCategories?: ProductCategory[];
}

export function Catalog({ initialProducts = [], initialCategories = [] }: CatalogProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [loading, setLoading] = useState<boolean>(!initialProducts.length);
  const [error, setError] = useState<string | null>(null);

  const shouldFetchCategories = initialCategories.length === 0;

  useEffect(() => {
    if (shouldFetchCategories) {
      fetchCategories()
        .then(({ product_categories }) => setCategories(product_categories))
        .catch(() => setError('Не удалось загрузить категории'))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="text-center text-muted-foreground py-16">Загрузка...</p>;
  if (error) return <p className="text-center text-destructive py-16">{error}</p>;

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Каталог</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories
        .filter((cat) => !cat.parent_category_id)
        .map((category) => (
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

    </section>
  );
}