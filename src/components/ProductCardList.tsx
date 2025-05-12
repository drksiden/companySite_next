// components/ProductCardList.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageOff, ShoppingBag } from 'lucide-react';
import { HttpTypes } from '@medusajs/types';

// Переносим тип сюда для ясности, или он может быть в глобальных типах
type ProductType = HttpTypes.StoreProduct;
// Тип для варианта, если он не экспортируется отдельно из HttpTypes
type ProductVariantType = HttpTypes.StoreProductVariant; // Или ProductVariant если есть такой тип

interface ProductCardListProps {
  products: ProductType[];
}

const formatPrice = (amount?: number, currencyCode: string = 'KZT'): string => {
  if (typeof amount === 'undefined' || amount === null) {
    return 'Цена по запросу'; // Более информативно
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
};

export function ProductCardList({ products }: ProductCardListProps) {
  const containerVariants = { /* ... */ };
  const itemVariants = { /* ... */ };

  if (!products || products.length === 0) {
    // Это сообщение должно отображаться компонентом SubCategoryPage, если products пуст.
    // ProductCardList сам не должен решать, что делать, если товаров нет.
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <AnimatePresence>
        {products.map((product) => {
          const defaultVariant = product.variants?.[0] as ProductVariantType | undefined;

          let displayPriceAmount: number | undefined | null = undefined;
          let originalPriceAmount: number | undefined | null = undefined;
          let currencyCode = 'KZT'; // Валюта по умолчанию

          if (defaultVariant) {
            // Проверяем наличие calculated_price и его полей
            if (defaultVariant.calculated_price && typeof defaultVariant.calculated_price.calculated_amount === 'number') {
              displayPriceAmount = defaultVariant.calculated_price.calculated_amount;
              if (defaultVariant.calculated_price.original_amount && defaultVariant.calculated_price.calculated_amount < defaultVariant.calculated_price.original_amount) {
                originalPriceAmount = defaultVariant.calculated_price.original_amount;
              }
            } else if (defaultVariant.prices && defaultVariant.prices.length > 0) {
              // Если нет calculated_price, берем первую цену из prices
              // Это может быть не всегда корректно, т.к. prices может содержать цены для разных контекстов
              displayPriceAmount = defaultVariant.prices[0].amount;
            }
            currencyCode = defaultVariant.prices?.[0]?.currency_code?.toUpperCase() || 'KZT';
          }
          
          const inStock = defaultVariant ? (defaultVariant.inventory_quantity ?? 0) > 0 || defaultVariant.allow_backorder === true : false;

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
            >
              <Card className="h-full flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <CardHeader className="p-0 relative">
                  <Link href={`/product/${product.handle}`} legacyBehavior={false} className="block">
                    <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title || 'Изображение товара'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                  </Link>
                  {!inStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2 z-10">
                      Нет в наличии
                    </Badge>
                  )}
                  {originalPriceAmount && displayPriceAmount && originalPriceAmount > displayPriceAmount && (
                     <Badge variant="outline" className="absolute top-2 left-2 z-10 bg-destructive text-destructive-foreground">
                       Скидка
                     </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-4 flex-grow flex flex-col">
                  <CardTitle className="text-md lg:text-lg font-semibold text-foreground mb-1 line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/product/${product.handle}`} legacyBehavior={false}>
                      {product.title || 'Без названия'}
                    </Link>
                  </CardTitle>
                  <div className="mt-auto pt-2"> {/* Добавлен pt-2 для отступа цены */}
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(displayPriceAmount, currencyCode)}
                    </p>
                    {originalPriceAmount && displayPriceAmount && originalPriceAmount > displayPriceAmount && (
                        <p className="text-sm text-muted-foreground line-through">
                            {formatPrice(originalPriceAmount, currencyCode)}
                        </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button asChild className="w-full" variant={inStock ? "default" : "outline"} disabled={!inStock}>
                    <Link href={`/product/${product.handle}`} legacyBehavior={false}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      {inStock ? 'Подробнее' : 'Нет в наличии'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}