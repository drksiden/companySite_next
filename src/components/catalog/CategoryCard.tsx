"use client";

import Link from "next/link";
import { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ImageOff,
  ArrowRight,
  Package,
  TrendingUp,
  Eye,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type {
  Category,
  CategoryWithChildren,
  CategoryCardProps,
} from "@/types/catalog";

interface EnhancedCategoryCardProps extends CategoryCardProps {
  priority?: boolean;
  showStats?: boolean;
  showHoverEffects?: boolean;
  onCategoryView?: (category: Category) => void;
}

export const CategoryCard = memo(function CategoryCard({
  category,
  showProductCount = false,
  variant = "card",
  className,
  priority = false,
  showStats = false,
  showHoverEffects = true,
  onCategoryView,
}: EnhancedCategoryCardProps) {
  // Приводим к типу с подсчетом товаров
  const categoryWithChildren = category as CategoryWithChildren;

  // Загружаем изображение категории
  const imageSrc = category.image_url || "/placeholder.jpg";

  // Обработчик клика
  const handleClick = useCallback(() => {
    onCategoryView?.(category);
  }, [category, onCategoryView]);

  // Формирование ссылки
  const categoryUrl = `/catalog?category=${category.slug}`;

  // Вычисляемые значения
  const computedValues = useMemo(() => {
    const productCount = categoryWithChildren.products_count || 0;
    const subcategoryCount = categoryWithChildren.children?.length || 0;

    return {
      productCount,
      subcategoryCount,
      hasSubcategories: subcategoryCount > 0,
      isPopular: productCount > 50,
      responsiveSizes:
        "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw",
    };
  }, [
    categoryWithChildren.products_count,
    categoryWithChildren.children?.length,
  ]);

  // Компонент содержимого изображения
  const ImageContent = useCallback(
    () => (
      <div className="relative w-full h-full overflow-hidden">
        {category.image_url ? (
          <Image
            src={imageSrc}
            alt={category.name}
            fill
            className="transition-transform duration-300 group-hover:scale-105 object-cover"
            priority={priority}
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        {/* Оверлей для лучшей читаемости */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    ),
    [category.image_url, category.name, imageSrc, priority],
  );

  // Компонент статистики
  const StatsContent = useCallback(() => {
    if (!showStats) return null;

    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {showProductCount && (
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{computedValues.productCount} товаров</span>
          </div>
        )}
        {computedValues.hasSubcategories && (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{computedValues.subcategoryCount} подкатегорий</span>
          </div>
        )}
        {computedValues.isPopular && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span>Популярная</span>
          </div>
        )}
      </div>
    );
  }, [showStats, showProductCount, computedValues]);

  // Рендер карточки в виде карты
  if (variant === "card") {
    return (
      <motion.div
        whileHover={showHoverEffects ? { y: -4 } : undefined}
        transition={{ duration: 0.2 }}
        onClick={handleClick}
      >
        <Card
          className={cn(
            "group relative overflow-hidden cursor-pointer",
            className,
          )}
        >
          {/* Изображение */}
          <div className="relative aspect-[4/3] bg-muted">
            <Link href={categoryUrl}>
              <ImageContent />
            </Link>

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {computedValues.isPopular && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-500/90 text-white"
                >
                  <Star className="h-3 w-3 mr-1" />
                  Популярная
                </Badge>
              )}
              {(category as any).is_featured && (
                <Badge variant="default" className="text-xs">
                  Рекомендуем
                </Badge>
              )}
            </div>
          </div>

          {/* Контент */}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-2">
              {category.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0 pb-2">
            {category.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {category.description}
              </p>
            )}

            <StatsContent />
          </CardContent>

          <CardFooter className="pt-0">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-between group"
            >
              <Link href={categoryUrl}>
                Смотреть товары
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Рендер плиточного варианта
  if (variant === "tile") {
    return (
      <motion.div
        whileHover={showHoverEffects ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.2 }}
        onClick={handleClick}
      >
        <Card
          className={cn(
            "group relative overflow-hidden cursor-pointer h-full",
            className,
          )}
        >
          <Link href={categoryUrl} className="block h-full">
            <div className="relative aspect-square bg-muted">
              <ImageContent />

              {/* Оверлей с информацией */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {category.name}
                  </h3>
                  {showProductCount && (
                    <p className="text-sm opacity-90">
                      {computedValues.productCount} товаров
                    </p>
                  )}
                  {computedValues.hasSubcategories && (
                    <p className="text-xs opacity-75">
                      {computedValues.subcategoryCount} подкатегорий
                    </p>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {computedValues.isPopular && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-yellow-500/90 text-white"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    ТОП
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </Card>
      </motion.div>
    );
  }

  // Рендер баннерного варианта
  if (variant === "banner") {
    return (
      <motion.div
        whileHover={showHoverEffects ? { scale: 1.01 } : undefined}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        <Card
          className={cn(
            "group relative overflow-hidden cursor-pointer",
            className,
          )}
        >
          <Link href={categoryUrl} className="block">
            <div className="relative aspect-[3/1] bg-muted">
              <ImageContent />

              {/* Контент поверх изображения */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent">
                <div className="absolute inset-0 flex items-center">
                  <div className="p-8 text-white max-w-lg">
                    <h2 className="text-3xl font-bold mb-2 line-clamp-2">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-lg opacity-90 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm opacity-75 mb-4">
                      {showProductCount && (
                        <span>{computedValues.productCount} товаров</span>
                      )}
                      {computedValues.hasSubcategories && (
                        <span>{computedValues.subcategoryCount} категорий</span>
                      )}
                    </div>

                    <Button variant="secondary" className="group">
                      Перейти в каталог
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {computedValues.isPopular && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/90 text-white"
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Популярная категория
                  </Badge>
                )}
                {(category as any).is_featured && (
                  <Badge variant="default">
                    <Eye className="h-4 w-4 mr-1" />
                    Рекомендуем
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        </Card>
      </motion.div>
    );
  }

  return null;
});

CategoryCard.displayName = "CategoryCard";

// Экспорт компонента по умолчанию
export default CategoryCard;
