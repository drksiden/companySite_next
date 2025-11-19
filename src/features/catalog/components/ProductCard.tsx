"use client";

import { useQueryClient } from "@tanstack/react-query";
import { memo, useCallback, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { CatalogProduct } from "@/lib/services/catalog";
import { catalogKeys } from "@/lib/hooks/useCatalog";
import { toast } from "sonner";

interface ProductCardProps {
  product: CatalogProduct;
  priority?: boolean;
}

// Server-side function to determine image source consistently
const getFinalImageSrc = (product: CatalogProduct): string => {
  // First, try thumbnail
  if (product.thumbnail) {
    const thumbnail = typeof product.thumbnail === "string" 
      ? product.thumbnail.trim() 
      : null;
    if (
      thumbnail &&
      thumbnail.length > 0 &&
      !thumbnail.includes("example.com") &&
      !thumbnail.includes("placeholder") &&
      (thumbnail.startsWith("http") || thumbnail.startsWith("/"))
    ) {
      return thumbnail;
    }
  }

  // Then, try images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Find first valid image URL
    for (const img of product.images) {
      let imageUrl: string | null = null;
      
      if (typeof img === "string") {
        imageUrl = img.trim();
      } else if (typeof img === "object" && img !== null) {
        const imgObj = img as { url?: string; src?: string; path?: string };
        imageUrl = imgObj.url || imgObj.src || imgObj.path || null;
      }
      
      if (
        imageUrl &&
        typeof imageUrl === "string" &&
        imageUrl.length > 0 &&
        !imageUrl.includes("example.com") &&
        !imageUrl.includes("placeholder") &&
        (imageUrl.startsWith("http") || imageUrl.startsWith("/"))
      ) {
        return imageUrl;
      }
    }
  }

  // Fallback to placeholder
  return "/images/placeholder-product.svg";
};

function ProductCard({ product, priority = false }: ProductCardProps) {
  const queryClient = useQueryClient();
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Проверяем избранное из localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wishlist = JSON.parse(localStorage.getItem('catalog-wishlist') || '[]');
      setIsInWishlist(wishlist.includes(product.id));
    }
  }, [product.id]);
  
  // Мемоизируем вычисления
  const imageSrc = useMemo(() => getFinalImageSrc(product), [product.thumbnail, product.images]);
  
  // Prefetch продукта при наведении для быстрой загрузки страницы
  const handleMouseEnter = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: catalogKeys.product(product.slug),
      queryFn: async () => {
        const response = await fetch(`/api/products/${product.slug}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error("Failed to fetch product");
        }
        const result = await response.json();
        return result.product || null;
      },
    });
  }, [product.slug, queryClient]);

  const { finalPrice, isOnSale, discountPercentage, isInStock, formattedPrice, oldPrice } = useMemo(() => {
    const final = product.sale_price || product.base_price;
    const onSale = !!(product.sale_price && product.sale_price < product.base_price);
    const discount = onSale
      ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
      : 0;
    const inStock = product.track_inventory ? product.inventory_quantity > 0 : true;
    const formatPrice = (price: number) => `${price.toLocaleString("kk-KZ")} ₸`;
    
    return {
      finalPrice: final,
      isOnSale: onSale,
      discountPercentage: discount,
      isInStock: inStock,
      formattedPrice: formatPrice(final),
      oldPrice: onSale ? formatPrice(product.base_price) : null,
    };
  }, [product.sale_price, product.base_price, product.track_inventory, product.inventory_quantity]);

  // Обработчик избранного
  const handleWishlistToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (typeof window !== 'undefined') {
      const wishlist = JSON.parse(localStorage.getItem('catalog-wishlist') || '[]');
      const newWishlist = [...wishlist];
      
      if (isInWishlist) {
        const index = newWishlist.indexOf(product.id);
        if (index > -1) {
          newWishlist.splice(index, 1);
          toast.success("Удалено из избранного");
        }
      } else {
        newWishlist.push(product.id);
        toast.success("Добавлено в избранное");
      }
      
      localStorage.setItem('catalog-wishlist', JSON.stringify(newWishlist));
      setIsInWishlist(!isInWishlist);
      
      // Отправляем кастомное событие для обновления счетчика в Header
      window.dispatchEvent(new CustomEvent('wishlist-updated', { 
        detail: { count: newWishlist.length } 
      }));
    }
  }, [isInWishlist, product.id]);

  return (
    <Card 
      className="group relative bg-[var(--card-bg)] shadow-sm hover:shadow-md transition-all overflow-hidden rounded-lg product-card hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
    >
      <Link href={`/catalog/product/${product.slug}`} prefetch className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div className="relative w-full h-48 overflow-hidden bg-[var(--image-bg)] rounded-t-lg">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain transition-all duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              quality={65}
              priority={priority}
              loading={priority ? undefined : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjwvc3ZnPg=="
              unoptimized={
                imageSrc === "/images/placeholder-product.svg" ||
                imageSrc.includes("r2.asia-ntb.kz") ||
                imageSrc.includes("r2.dev")
              }
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {isOnSale && (
                <Badge className="bg-[var(--sale-bg)] hover:bg-[var(--sale-hover-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-bold px-2 py-0.5 rounded-full text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-[var(--featured-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-bold px-2 py-0.5 rounded-full text-xs">
                  ХИТ
                </Badge>
              )}
              {!isInStock && (
                <Badge className="bg-[var(--out-of-stock-bg)] text-[var(--badge-text)] shadow-md backdrop-blur-sm border-0 font-medium px-2 py-0.5 rounded-full text-xs">
                  Нет в наличии
                </Badge>
              )}
            </div>

            {/* Wishlist Button - moved to top with higher z-index */}
            <div className="absolute top-2 right-2 z-30">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background transition-all shadow-sm ${
                  isInWishlist ? 'text-red-500' : 'text-foreground dark:text-muted-foreground'
                }`}
                onClick={handleWishlistToggle}
                aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-white/70 dark:bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm z-20">
              <div className="text-center text-[var(--overlay-text)] p-3 max-w-[90%]">
                {product.short_description && (
                  <p className="text-xs leading-relaxed line-clamp-2 opacity-90 mb-1">
                    {product.short_description}
                  </p>
                )}
                <div className="mt-1 inline-flex items-center text-xs font-medium bg-[var(--overlay-button-bg)] px-2 py-1 rounded-full hover:bg-[var(--overlay-button-hover-bg)] transition-colors">
                  Подробнее →
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="p-3 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs text-black dark:text-white font-semibold uppercase tracking-wider bg-[var(--brand-bg)] px-1.5 py-0.5 rounded-md inline-block">
                  {product.brands.name}
                </p>
              )}
              {/* Title */}
              <h3 className="font-bold text-sm leading-tight text-black dark:text-white group-hover:text-[var(--title-hover-text)] transition-colors duration-300">
                {product.name}
              </h3>
              {/* Category */}
              {product.categories?.name && (
                <p className="text-xs text-black dark:text-white font-medium">
                  {product.categories.name}
                </p>
              )}
            </div>

            {/* Bottom Section */}
            <div className="mt-2 space-y-2">
              {/* Price Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-black dark:text-white">
                    {formattedPrice}
                  </span>
                  {isOnSale && oldPrice && (
                    <span className="text-xs text-[var(--price-old-text)] line-through font-medium">
                      {oldPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {product.track_inventory && (
                <div className="flex items-center gap-1 bg-[var(--stock-bg)] px-2 py-1 rounded-md">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isInStock ? "bg-[var(--stock-dot-in)] animate-pulse" : "bg-[var(--stock-dot-out)]"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      isInStock ? "text-[var(--stock-text-in)]" : "text-[var(--stock-text-out)]"
                    }`}
                  >
                    {isInStock
                      ? `В наличии: ${product.inventory_quantity} шт.`
                      : "Нет в наличии"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}

// Мемоизированная версия для оптимизации производительности
export default memo(ProductCard, (prevProps, nextProps) => {
  // Сравниваем только ключевые поля для предотвращения лишних ререндеров
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.slug === nextProps.product.slug &&
    prevProps.product.inventory_quantity === nextProps.product.inventory_quantity &&
    prevProps.product.sale_price === nextProps.product.sale_price &&
    prevProps.product.base_price === nextProps.product.base_price &&
    prevProps.product.thumbnail === nextProps.product.thumbnail &&
    prevProps.priority === nextProps.priority
  );
});