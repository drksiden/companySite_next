'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Category } from '@/types/supabase';
import { ChevronRight, Package, LayoutGrid } from 'lucide-react';

export interface CategoryCardProps {
  category: Category;
  showProductCount?: boolean;
  productCount?: number;
  variant?: 'default' | 'compact' | 'banner';
  className?: string;
  basePath?: string;
  showDescription?: boolean;
  priority?: boolean;
}

export function CategoryCard({
  category,
  showProductCount = false,
  productCount,
  variant = 'default',
  className,
  basePath = '/catalog',
  showDescription = true,
  priority = false
}: CategoryCardProps) {
  const categoryPath = `${basePath}/${category.handle}`;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  // Компактный вариант для боковой панели или списков
  if (variant === 'compact') {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={categoryPath}>
          <Card className={cn(
            "group cursor-pointer border hover:border-primary/50 transition-all duration-200 hover:shadow-md",
            className
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Иконка или миниатюра */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-lg"
                      priority={priority}
                    />
                  ) : (
                    <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                {/* Название и счетчик */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                    {category.name}
                  </h3>
                  {showProductCount && productCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {productCount} {productCount === 1 ? 'товар' : productCount < 5 ? 'товара' : 'товаров'}
                    </p>
                  )}
                </div>
                
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Баннерный вариант для главной страницы
  if (variant === 'banner') {
    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={categoryPath}>
          <Card className={cn(
            "group relative overflow-hidden cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-32 md:h-40",
            className
          )}>
            {/* Фоновое изображение */}
            {category.image_url && (
              <div className="absolute inset-0">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  priority={priority}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
              </div>
            )}
            
            <CardContent className="relative p-6 h-full flex flex-col justify-end text-white">
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1 group-hover:text-primary-foreground transition-colors">
                  {category.name}
                </h3>
                {showDescription && category.description && (
                  <p className="text-sm text-white/90 line-clamp-2">
                    {category.description}
                  </p>
                )}
                {showProductCount && productCount !== undefined && (
                  <Badge variant="secondary" className="mt-2 w-fit">
                    {productCount} {productCount === 1 ? 'товар' : productCount < 5 ? 'товара' : 'товаров'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    );
  }

  // Стандартный вариант карточки
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "group h-full flex flex-col overflow-hidden cursor-pointer border hover:border-primary/50 transition-all duration-300 hover:shadow-lg",
        className
      )}>
        <Link href={categoryPath} className="h-full flex flex-col">
          {/* Изображение */}
          <div className="relative w-full aspect-[4/3] bg-muted overflow-hidden">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority={priority}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/70">
                <Package className="h-12 w-12 text-muted-foreground/70" />
              </div>
            )}
            
            {/* Бейдж с количеством товаров */}
            {showProductCount && productCount !== undefined && (
              <Badge 
                variant="secondary" 
                className="absolute top-3 right-3 bg-background/90 text-foreground"
              >
                {productCount}
              </Badge>
            )}
          </div>

          {/* Контент */}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {category.name}
            </CardTitle>
          </CardHeader>

          {showDescription && category.description && (
            <CardContent className="flex-1 pt-0 pb-2">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {category.description}
              </p>
            </CardContent>
          )}

          {/* Футер */}
          <CardFooter className="pt-2">
            <Button 
              variant="ghost" 
              className="w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <span>Смотреть товары</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Link>
      </Card>
    </motion.div>
  );
}

// Компонент для списка категорий с анимацией
export interface CategoryCardListProps {
  categories: Category[];
  showProductCount?: boolean;
  productCounts?: Record<string, number>;
  variant?: CategoryCardProps['variant'];
  className?: string;
  basePath?: string;
  showDescription?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function CategoryCardList({
  categories,
  showProductCount = false,
  productCounts = {},
  variant = 'default',
  className,
  basePath = '/catalog',
  showDescription = true,
  columns = { sm: 2, md: 3, lg: 4, xl: 6 }
}: CategoryCardListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const gridClasses = cn(
    "grid gap-4 lg:gap-6",
    `grid-cols-1`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    className
  );

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Категории не найдены</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={gridClasses}
    >
      {categories.map((category, index) => (
        <CategoryCard
          key={category.id}
          category={category}
          showProductCount={showProductCount}
          productCount={productCounts[category.id]}
          variant={variant}
          basePath={basePath}
          showDescription={showDescription}
          priority={index < 6} // Первые 6 изображений загружаем с приоритетом
        />
      ))}
    </motion.div>
  );
}