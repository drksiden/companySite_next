"use client";

import Link from "next/link";
import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Share2,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import type { SearchProductsResult } from "@/types/catalog";

interface ProductCardProps {
  product: SearchProductsResult;
  variant?: "grid" | "list" | "compact";
  showQuickView?: boolean;
  showWishlist?: boolean;
  showShare?: boolean;
  className?: string;
  priority?: boolean;
  onQuickView?: (product: SearchProductsResult) => void;
  onAddToWishlist?: (product: SearchProductsResult) => void;
  onAddToCart?: (product: SearchProductsResult) => void;
}

export function ProductCard({
  product,
  variant = "grid",
  showQuickView = true,
  showWishlist = true,
  showShare = false,
  className,
  priority = false,
  onQuickView,
  onAddToWishlist,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Простая обработка изображений
  const imageSrc =
    product.thumbnail ||
    (product.images && product.images[0]) ||
    "/placeholder.jpg";

  // Мемоизированные обработчики событий
  const handleWishlistClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsInWishlist(!isInWishlist);
      onAddToWishlist?.(product);

      // Показываем уведомление
      toast.success(
        isInWishlist ? "Удалено из избранного" : "Добавлено в избранное",
        {
          duration: 2000,
        },
      );
    },
    [isInWishlist, onAddToWishlist, product],
  );

  const handleCartClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onAddToCart?.(product);

      // Показываем уведомление
      toast.success("Товар добавлен в корзину", {
        duration: 2000,
      });
    },
    [onAddToCart, product],
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onQuickView?.(product);
    },
    [onQuickView, product],
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Мемоизированные вычисления для производительности
  const productState = useMemo(() => {
    const isInStock = product.track_inventory
      ? (product.inventory_quantity || 0) > 0
      : true;

    const hasDiscount =
      product.is_on_sale && (product.discount_percentage || 0) > 0;

    const isNew =
      product.created_at &&
      new Date(product.created_at) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const formattedPrice =
      product.formatted_price ||
      `${(product.final_price || 0).toLocaleString("ru-RU")} ₸`;

    return { isInStock, hasDiscount, isNew, formattedPrice };
  }, [
    product.track_inventory,
    product.inventory_quantity,
    product.is_on_sale,
    product.discount_percentage,
    product.created_at,
    product.formatted_price,
    product.final_price,
  ]);

  const { isInStock, hasDiscount, isNew, formattedPrice } = productState;

  if (variant === "list") {
    return (
      <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            "group relative overflow-hidden bg-card shadow-sm hover:shadow-md transition-all duration-300",
            !isInStock && "opacity-75",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-32 bg-gray-50 flex-shrink-0 overflow-hidden rounded-l-lg">
              <Link
                href={`/product/${product.slug}`}
                className="block w-full h-full"
              >
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  className="transition-transform duration-300 group-hover:scale-105 object-cover"
                  priority={priority}
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 192px"
                />
              </Link>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs">
                    -{product.discount_percentage}%
                  </Badge>
                )}
                {isNew && (
                  <Badge variant="secondary" className="text-xs">
                    Новинка
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge variant="default" className="text-xs">
                    Хит
                  </Badge>
                )}
              </div>

              {/* Quick Actions */}
              {isHovered && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {showWishlist && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
                      onClick={handleWishlistClick}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          isInWishlist
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  )}
                  {showQuickView && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-background/90 hover:bg-background"
                      onClick={handleQuickView}
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {product.brand_name && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.brand_name}
                    </p>
                  )}

                  {product.short_description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {hasDiscount && product.base_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.base_price.toLocaleString("ru-RU")} ₸
                          </span>
                        )}
                        <span className="text-lg font-bold text-foreground">
                          {formattedPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {isInStock ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />В наличии
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Нет в наличии
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Временно скрыта кнопка "В корзину" */}
                  {/*
                  <Button
                    onClick={handleCartClick}
                    disabled={!isInStock}
                    size="sm"
                    className="shrink-0"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                  </Button>
                  */}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid variant (default)
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-card shadow-sm hover:shadow-lg transition-all duration-300",
          !isInStock && "opacity-75",
          variant === "compact" && "max-w-xs",
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="transition-all duration-300 group-hover:scale-105 object-cover"
              priority={priority}
              quality={variant === "compact" ? 75 : 85}
              sizes={
                variant === "compact"
                  ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
              }
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{product.discount_percentage}%
              </Badge>
            )}
            {isNew && (
              <Badge variant="secondary" className="text-xs">
                Новинка
              </Badge>
            )}
            {product.is_featured && (
              <Badge variant="default" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Хит
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 flex flex-col gap-2"
              >
                {showWishlist && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-sm"
                    onClick={handleWishlistClick}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        isInWishlist
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground",
                      )}
                    />
                  </Button>
                )}
                {showQuickView && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-sm"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
                {showShare && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-sm"
                  >
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Status Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Badge variant="secondary" className="bg-background/90">
                Нет в наличии
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2 text-sm leading-tight">
                {product.name}
              </h3>
            </Link>

            {product.brand_name && (
              <p className="text-xs text-muted-foreground">
                {product.brand_name}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-2">
          {product.short_description && variant !== "compact" && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount && product.base_price && (
              <span className="text-sm text-muted-foreground line-through">
                {product.base_price.toLocaleString("ru-RU")} ₸
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              {formattedPrice}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mt-2">
            {isInStock ? (
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />В наличии
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Под заказ
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          {/* Временно скрыта кнопка "В корзину" */}
          {/*
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={handleCartClick}
              disabled={!isInStock}
              size="sm"
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />В корзину
            </Button>
          </div>
          */}
        </CardFooter>

        {/* Quick View Button for Mobile */}
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 sm:hidden"
          >
            <Button
              size="sm"
              variant="secondary"
              className="h-9 w-9 p-0 bg-background/90 hover:bg-background shadow-sm"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

// Мемоизированный экспорт для оптимизации производительности
export const MemoizedProductCard = memo(ProductCard, (prevProps, nextProps) => {
  // Сравниваем только ключевые поля для предотвращения лишних ререндеров
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.inventory_quantity ===
      nextProps.product.inventory_quantity &&
    prevProps.product.thumbnail === nextProps.product.thumbnail &&
    prevProps.variant === nextProps.variant &&
    prevProps.priority === nextProps.priority
  );
});

MemoizedProductCard.displayName = "MemoizedProductCard";

// Экспортируем как мемоизированную версию по умолчанию для production
export default process.env.NODE_ENV === "production"
  ? MemoizedProductCard
  : ProductCard;
