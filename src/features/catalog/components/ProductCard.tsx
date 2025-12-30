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
import { useDisplaySettings } from "@/lib/hooks/useDisplaySettings";

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
  const { settings: displaySettings } = useDisplaySettings();
  
  // Дефолтные настройки на случай если они еще не загружены
  const safeDisplaySettings = displaySettings || {
    show_stock_status: true,
    show_quantity: true,
    show_made_to_order: true,
    made_to_order_text: "На заказ",
    in_stock_text: "В наличии",
    out_of_stock_text: "Нет в наличии",
    low_stock_threshold: 5,
    show_low_stock_warning: true,
    low_stock_text: "Осталось мало",
  };
  
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

  const { finalPrice, isOnSale, discountPercentage, isInStock, isMadeToOrder, formattedPrice, oldPrice } = useMemo(() => {
    const final = product.sale_price || product.base_price;
    const onSale = !!(product.sale_price && product.sale_price < product.base_price);
    const discount = onSale
      ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
      : 0;
    
    // Определяем наличие товара с учетом track_inventory, inventory_quantity и status
    const inStock = (() => {
      // Если статус made_to_order - это отдельный статус, не "в наличии"
      if (product.status === 'made_to_order') {
        return false; // made_to_order - это не "в наличии", это отдельный статус
      }
      
      // Если статус out_of_stock, draft или archived - товар не в наличии
      if (product.status === 'out_of_stock' || product.status === 'draft' || product.status === 'archived') {
        return false;
      }
      
      // Если не отслеживается наличие (track_inventory = false), товар всегда в наличии
      if (!product.track_inventory) {
        return true;
      }
      
      // Если отслеживается наличие, проверяем количество
      return (product.inventory_quantity || 0) > 0;
    })();
    
    const isMadeToOrder = product.status === 'made_to_order';
    
    const formatPrice = (price: number) => `${price.toLocaleString("kk-KZ")} ₸`;
    
    return {
      finalPrice: final,
      isOnSale: onSale,
      discountPercentage: discount,
      isInStock: inStock,
      isMadeToOrder: isMadeToOrder,
      formattedPrice: formatPrice(final),
      oldPrice: onSale ? formatPrice(product.base_price) : null,
    };
  }, [product.sale_price, product.base_price, product.track_inventory, product.inventory_quantity, product.status]);

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
      className="group relative bg-card border-2 border-transparent hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl product-card hover:-translate-y-2 py-0 gap-0"
      onMouseEnter={handleMouseEnter}
    >
      <Link href={`/catalog/product/${product.slug}`} prefetch className="block h-full">
        <div className="relative h-full flex flex-col">
          {/* Image Section */}
          <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className="object-contain transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
              quality={85}
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

            {/* Simple dark overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
              {isOnSale && (
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg backdrop-blur-sm border-0 font-bold px-3 py-1 rounded-full text-xs animate-pulse">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg backdrop-blur-sm border-0 font-bold px-3 py-1 rounded-full text-xs">
                  ⭐ ХИТ
                </Badge>
              )}
              {isMadeToOrder && safeDisplaySettings.show_made_to_order && (
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg backdrop-blur-sm border-0 font-medium px-3 py-1 rounded-full text-xs">
                  {safeDisplaySettings.made_to_order_text}
                </Badge>
              )}
            </div>

            {/* Wishlist Button - появляется при наведении или если товар в избранном */}
            <div className={`absolute top-2 right-2 z-30 transition-opacity duration-300 ${
              isInWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full bg-background/95 backdrop-blur-md hover:bg-background transition-all duration-300 shadow-lg hover:scale-110 ${
                  isInWishlist ? 'text-red-500 bg-red-50 dark:bg-red-950' : 'text-foreground'
                }`}
                onClick={handleWishlistToggle}
                aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
              >
                <Heart className={`h-4 w-4 transition-all duration-300 ${isInWishlist ? 'fill-current scale-110' : ''}`} />
              </Button>
            </div>

            {/* Quick View Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center z-20 pb-4">
              <div className="text-center p-3 max-w-[85%]">
                {product.short_description && (
                  <p className="text-sm leading-relaxed line-clamp-2 mb-2 font-medium text-white drop-shadow-lg">
                    {product.short_description}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 text-sm font-semibold bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-full transition-all duration-300 border border-white/30 text-white">
                  Подробнее
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="px-3 pt-3 pb-3 flex flex-col bg-card !px-3">
            <div className="space-y-1.5 mb-2">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary dark:text-primary px-2 py-0.5 rounded-md inline-block">
                  {product.brands.name}
                </p>
              )}
              {/* Title */}
              <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              {/* Category */}
              {product.categories?.name && (
                <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {product.categories.name}
                </p>
              )}
            </div>

            {/* Bottom Section */}
            <div className="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
              {/* Price Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formattedPrice}
                  </span>
                  {isOnSale && oldPrice && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through font-medium">
                      {oldPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              {safeDisplaySettings.show_stock_status && (() => {
                const isMadeToOrderValue = product.status === 'made_to_order';
                const showQuantity = safeDisplaySettings.show_quantity && product.track_inventory;
                const showMadeToOrder = safeDisplaySettings.show_made_to_order && isMadeToOrderValue;
                
                // Определяем текст статуса
                const statusText = isMadeToOrderValue
                  ? showMadeToOrder
                    ? safeDisplaySettings.made_to_order_text
                    : ""
                  : isInStock
                    ? showQuantity
                      ? `${safeDisplaySettings.in_stock_text}: ${product.inventory_quantity || 0} шт.`
                      : safeDisplaySettings.in_stock_text
                    : product.status === 'out_of_stock'
                      ? safeDisplaySettings.out_of_stock_text
                      : product.status === 'draft'
                        ? "Черновик"
                        : product.status === 'archived'
                          ? "Архивирован"
                          : safeDisplaySettings.out_of_stock_text;
                
                // Не показываем блок, если текст пустой
                if (!statusText) return null;
                
                return (
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isMadeToOrderValue
                          ? "bg-blue-500 animate-pulse"
                          : isInStock 
                            ? "bg-green-500 animate-pulse" 
                            : "bg-red-500"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isMadeToOrderValue
                          ? "text-blue-700 dark:text-blue-400"
                          : isInStock 
                            ? "text-green-700 dark:text-green-400" 
                            : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                );
              })()}

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