"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Heart, X, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CatalogProduct } from "@/lib/services/catalog";

interface WishlistDropdownProps {
  wishlistCount: number;
}

export function WishlistDropdown({ wishlistCount }: WishlistDropdownProps) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Загружаем список ID избранного
  const loadWishlist = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalog-wishlist');
      const ids = saved ? JSON.parse(saved) : [];
      setWishlist(ids);
      return ids;
    }
    return [];
  }, []);

  // Загружаем данные товаров
  const loadProducts = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    try {
      const productPromises = ids.map(async (id) => {
        const response = await fetch(`/api/products/by-id/${id}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error("Failed to fetch product");
        }
        const result = await response.json();
        return result.success ? result.product : null;
      });
      
      const results = await Promise.allSettled(productPromises);
      
      const loadedProducts = results
        .filter((result): result is PromiseFulfilledResult<CatalogProduct> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading wishlist products:', error);
      toast.error("Ошибка загрузки избранного");
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление из избранного
  const removeFromWishlist = useCallback((productId: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalog-wishlist');
      const ids = saved ? JSON.parse(saved) : [];
      const newIds = ids.filter((id: string) => id !== productId);
      localStorage.setItem('catalog-wishlist', JSON.stringify(newIds));
      
      setWishlist(newIds);
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      // Отправляем событие для обновления счетчика
      window.dispatchEvent(new CustomEvent('wishlist-updated', { 
        detail: { count: newIds.length } 
      }));
      
      toast.success("Удалено из избранного");
    }
  }, []);

  // Загружаем при открытии
  useEffect(() => {
    if (open) {
      const ids = loadWishlist();
      loadProducts(ids);
    }
  }, [open, loadWishlist, loadProducts]);

  // Слушаем обновления избранного
  useEffect(() => {
    const handleWishlistUpdate = () => {
      if (open) {
        const ids = loadWishlist();
        loadProducts(ids);
      }
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [open, loadWishlist, loadProducts]);

  const getImageSrc = (product: CatalogProduct): string => {
    // Проверяем thumbnail
    if (product.thumbnail) {
      const thumbnail = typeof product.thumbnail === "string" 
        ? product.thumbnail.trim() 
        : null;
      if (
        thumbnail && 
        thumbnail.length > 0 && 
        !thumbnail.includes("placeholder") &&
        (thumbnail.startsWith("http") || thumbnail.startsWith("/"))
      ) {
        return thumbnail;
      }
    }
    
    // Проверяем images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      for (const img of product.images) {
        if (typeof img === "string" && img.trim().length > 0) {
          const imageUrl = img.trim();
          if (
            !imageUrl.includes("placeholder") &&
            (imageUrl.startsWith("http") || imageUrl.startsWith("/"))
          ) {
            return imageUrl;
          }
        }
      }
    }
    
    return "/images/placeholder-product.svg";
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("kk-KZ")} ₸`;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:text-primary"
          aria-label="Избранное"
        >
          <Heart className="h-5 w-5" />
          {wishlistCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {wishlistCount > 99 ? '99+' : wishlistCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        alignOffset={0}
        collisionPadding={16}
        className="w-[calc(100vw-2rem)] sm:w-80 max-w-[90vw] p-0"
      >
        <DropdownMenuLabel className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <span>Избранное</span>
            {wishlistCount > 0 && (
              <Badge variant="secondary">{wishlistCount}</Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Избранное пусто
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Добавьте товары в избранное, чтобы вернуться к ним позже
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="py-2">
              {products.map((product) => {
                const imageSrc = getImageSrc(product);
                const finalPrice = product.sale_price || product.base_price;
                const isOnSale = !!(product.sale_price && product.sale_price < product.base_price);

                return (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-accent/50 transition-colors group"
                  >
                    <Link
                      href={`/catalog/product/${product.slug}`}
                      className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                        unoptimized={
                          imageSrc === "/images/placeholder-product.svg" ||
                          imageSrc.includes("r2.asia-ntb.kz") ||
                          imageSrc.includes("r2.dev")
                        }
                      />
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/catalog/product/${product.slug}`}
                        className="block"
                        onClick={() => setOpen(false)}
                      >
                        <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {product.name}
                        </h4>
                      </Link>
                      
                      {product.brands?.name && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {product.brands.name}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-bold text-foreground">
                            {formatPrice(finalPrice)}
                          </span>
                          {isOnSale && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatPrice(product.base_price)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            asChild
                          >
                            <Link
                              href={`/catalog/product/${product.slug}`}
                              onClick={() => setOpen(false)}
                              aria-label="Перейти к товару"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromWishlist(product.id)}
                            aria-label="Удалить из избранного"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        
        {products.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-3 border-t">
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/account/wishlist" onClick={() => setOpen(false)}>
                  Посмотреть все избранное
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

