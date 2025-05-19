'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageOff, ShoppingBag } from 'lucide-react';
import { HttpTypes } from '@medusajs/types';

type ProductType = HttpTypes.StoreProduct;
interface ProductVariantType extends HttpTypes.StoreProductVariant {
  prices?: Array<{
    id?: string;
    amount: number;
    currency_code: string;
    region_id?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

interface ProductCardListProps {
  products: ProductType[];
}

const formatPrice = (amount?: number | null, currencyCode: string = 'KZT'): string => {
  if (amount == null) {
    return 'Цена по запросу';
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
};

export function ProductCardList({ products }: ProductCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
    >
      <AnimatePresence>
        {products.map((product) => {
          const defaultVariant = product.variants?.[0] as ProductVariantType | undefined;

          let displayPriceAmount: number | null = null;
          let originalPriceAmount: number | null = null;
          let currencyCode = 'KZT';

          if (defaultVariant) {
            console.log(`[ProductCardList] Variant for ${product.title}:`, {
              calculated_price: defaultVariant.calculated_price,
              prices: defaultVariant.prices,
              currency_code: defaultVariant.currency_code,
            });

            if (defaultVariant.calculated_price?.calculated_amount != null) {
              displayPriceAmount = defaultVariant.calculated_price.calculated_amount;
              if (
                defaultVariant.calculated_price.original_amount != null &&
                defaultVariant.calculated_price.calculated_amount < defaultVariant.calculated_price.original_amount
              ) {
                originalPriceAmount = defaultVariant.calculated_price.original_amount;
              }
              currencyCode = defaultVariant.calculated_price.currency_code?.toUpperCase() || 'KZT';
            } else if (defaultVariant.prices?.length > 0) {
              displayPriceAmount = defaultVariant.prices[0].amount ?? null;
              currencyCode = defaultVariant.prices[0].currency_code?.toUpperCase() || 'KZT';
            } else {
              console.warn(`[ProductCardList] No price data for ${product.title}`);
            }
          } else {
            console.warn(`[ProductCardList] No variant for ${product.title}`);
          }

          const inStock = defaultVariant
            ? defaultVariant.manage_inventory === false ||
              (defaultVariant.inventory_quantity != null && defaultVariant.inventory_quantity > 0) ||
              defaultVariant.allow_backorder === true
            : true;

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              layout
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Link href={`/product/${product.handle}`} className="block">
                    <div className="relative w-full h-48 bg-muted">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.title || 'Изображение товара'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-4"
                          priority={false}
                          placeholder="blur"
                          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI/wN4RtnBkAAAAABJRU5ErkJggg=="
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                          <ImageOff className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                    </div>
                  </Link>
                  {originalPriceAmount != null && displayPriceAmount != null && originalPriceAmount > displayPriceAmount && (
                    <Badge variant="outline" className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                      Скидка
                    </Badge>
                  )}
                  {!inStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      Нет в наличии
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    <Link href={`/product/${product.handle}`}>
                      {product.title || 'Без названия'}
                    </Link>
                  </h3>
                  <div className="mt-auto">
                    <p className="text-xl font-bold text-primary">
                      {formatPrice(displayPriceAmount, currencyCode)}
                    </p>
                    {originalPriceAmount != null && displayPriceAmount != null && originalPriceAmount > displayPriceAmount && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatPrice(originalPriceAmount, currencyCode)}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    asChild
                    className="w-full"
                    variant={inStock ? 'default' : 'outline'}
                    disabled={!inStock}
                  >
                    <Link href={`/product/${product.handle}`}>
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