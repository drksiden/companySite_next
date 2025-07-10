'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageOff } from 'lucide-react';
// Импортируем Category и CategoryWithChildren из @/types/catalog
import { Category, CategoryWithChildren } from '@/types/catalog';
import { CategoryCardProps } from '@/types/catalog';

export function CategoryCard({ category, showProductCount = false, variant = 'card', className }: CategoryCardProps) {
  const defaultDescription = `Ознакомьтесь с товарами в категории "${category.name}".`;

  // Убеждаемся, что category имеет тип CategoryWithChildren для доступа к products_count
  const categoryWithProductCount = category as CategoryWithChildren;

  if (variant === 'banner') {
    return (
      <Link href={`/catalog/${categoryWithProductCount.slug}`} className="block w-full">
        <Card className={`relative w-full h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-md group ${className}`}>
          {categoryWithProductCount.image_url ? (
            <Image
              src={categoryWithProductCount.image_url}
              alt={categoryWithProductCount.name}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <ImageOff className="w-24 h-24 text-gray-400 dark:text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
            <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">{categoryWithProductCount.name}</CardTitle>
            <p className="text-sm sm:text-base line-clamp-2">{categoryWithProductCount.description || defaultDescription}</p>
            {showProductCount && categoryWithProductCount.products_count !== undefined && (
              <p className="text-xs sm:text-sm mt-1">{categoryWithProductCount.products_count} товаров</p>
            )}
            <Button className="mt-4 self-start bg-primary hover:bg-primary/90 text-primary-foreground">
              Смотреть товары
            </Button>
          </div>
        </Card>
      </Link>
    );
  }

  // Default 'card' variant
  return (
    <Card className={`h-full flex flex-col overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl font-semibold text-foreground text-center truncate">
          {categoryWithProductCount.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-grow flex flex-col items-center">
        <div className="relative w-full aspect-[4/3] mb-4 bg-muted rounded-md overflow-hidden group">
          {categoryWithProductCount.image_url ? (
            <Image
              src={categoryWithProductCount.image_url}
              alt={categoryWithProductCount.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <ImageOff className="w-16 h-16 text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-center line-clamp-3 flex-grow">
          {categoryWithProductCount.description || defaultDescription}
        </p>
        {showProductCount && categoryWithProductCount.products_count !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">{categoryWithProductCount.products_count} товаров</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link href={`/catalog/${categoryWithProductCount.slug}`}>
            Смотреть товары
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}