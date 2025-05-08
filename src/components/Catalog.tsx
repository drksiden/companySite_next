// @/components/Catalog.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCategories, Product, ProductCategory } from '@/lib/medusaClient';
import { Package, Search } from 'lucide-react';

interface CatalogProps {
  initialProducts?: Product[];
  initialCategories?: ProductCategory[];
  parentCategoryId?: string | null;
}

export function Catalog({ initialProducts = [], initialCategories = [], parentCategoryId = null }: CatalogProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);
  const [products] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

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

  const filteredCategories = categories.filter((cat) => cat.parent_category_id === parentCategoryId);

  const filteredProducts = products
    .filter((product) => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price-asc':
          return (a.variants[0]?.prices[0]?.amount || 0) - (b.variants[0]?.prices[0]?.amount || 0);
        case 'price-desc':
          return (b.variants[0]?.prices[0]?.amount || 0) - (a.variants[0]?.prices[0]?.amount || 0);
        default:
          return 0;
      }
    });

  if (loading) return <p className="text-center text-muted-foreground py-16">Загрузка...</p>;
  if (error) return <p className="text-center text-destructive py-16">{error}</p>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      {filteredCategories.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {parentCategoryId ? 'Подкатегории' : 'Каталог'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <motion.div key={category.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={(category.metadata?.thumbnail as string) || '/images/placeholder-category.svg'}
                        alt={category.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-muted-foreground">{category.description || 'Описание категории отсутствует.'}</p>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/catalog/${category.handle}`}>Смотреть товары</Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {products.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортировать по" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">По названию</SelectItem>
                <SelectItem value="price-asc">По возрастанию цены</SelectItem>
                <SelectItem value="price-desc">По убыванию цены</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredProducts.map((product) => {
                const variant = product.variants?.[0];
                const price = variant?.prices?.[0]?.amount;
                const inStock = variant?.inventory_quantity > 0;
                
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardHeader>
                        <div className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden">
                          <Image
                            src={(product.metadata?.thumbnail as string) || '/images/placeholder-product.svg'}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                          {!inStock && (
                            <Badge variant="destructive" className="absolute top-2 right-2">
                              Нет в наличии
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl text-foreground">{product.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2">
                          {product.description || 'Описание товара отсутствует.'}
                        </p>
                        {price !== undefined && (
                          <p className="text-lg font-semibold mt-2">
                            {price / 100} ₽
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full" disabled={!inStock}>
                          <Link href={`/product/${product.handle}`}>
                            {inStock ? 'Подробнее' : 'Нет в наличии'}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {filteredCategories.length === 0 && products.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Категории и товары отсутствуют</p>
        </div>
      )}
    </section>
  );
}