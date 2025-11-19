"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, X, ShoppingBag, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CatalogProduct } from "@/lib/services/catalog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export default function AccountWishlistPage() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
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

  // Очистка всего избранного
  const clearWishlist = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('catalog-wishlist', JSON.stringify([]));
      setWishlist([]);
      setProducts([]);
      
      window.dispatchEvent(new CustomEvent('wishlist-updated', { 
        detail: { count: 0 } 
      }));
      
      toast.success("Избранное очищено");
    }
  }, []);

  // Загружаем при монтировании
  useEffect(() => {
    const ids = loadWishlist();
    loadProducts(ids);
  }, [loadWishlist, loadProducts]);

  // Слушаем обновления избранного
  useEffect(() => {
    const handleWishlistUpdate = () => {
      const ids = loadWishlist();
      loadProducts(ids);
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist-updated', handleWishlistUpdate);
  }, [loadWishlist, loadProducts]);

  const getImageSrc = (product: CatalogProduct): string => {
    if (product.thumbnail) {
      const thumbnail = typeof product.thumbnail === "string" 
        ? product.thumbnail.trim() 
        : null;
      if (thumbnail && thumbnail.length > 0 && !thumbnail.includes("placeholder")) {
        return thumbnail;
      }
    }
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string" && firstImage.length > 0) {
        return firstImage;
      }
    }
    return "/images/placeholder-product.svg";
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("kk-KZ")} ₸`;
  };

  const breadcrumbs = [
    { name: "Главная", url: "/" },
    { name: "Избранное", url: "/account/wishlist" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Главная</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Избранное</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              Избранное
            </h1>
            <p className="text-muted-foreground">
              {products.length > 0 
                ? `${products.length} ${products.length === 1 ? 'товар' : products.length < 5 ? 'товара' : 'товаров'} в избранном`
                : 'Ваши избранные товары появятся здесь'}
            </p>
          </div>
          
          {products.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Очистить все
            </Button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-6 w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative mb-6">
              <Heart className="h-24 w-24 text-muted-foreground/30" />
              <Heart className="h-16 w-16 text-muted-foreground/50 absolute top-4 left-4" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Избранное пусто
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Добавьте товары в избранное, чтобы вернуться к ним позже. 
              Нажмите на иконку сердца на карточке товара, чтобы добавить его в избранное.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/catalog">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Перейти в каталог
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  На главную
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const imageSrc = getImageSrc(product);
              const finalPrice = product.sale_price || product.base_price;
              const isOnSale = !!(product.sale_price && product.sale_price < product.base_price);
              const discountPercentage = isOnSale
                ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
                : 0;
              const isInStock = product.track_inventory
                ? product.inventory_quantity > 0
                : true;

              return (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden hover:shadow-lg transition-all"
                >
                  <Link href={`/catalog/product/${product.slug}`} className="block">
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        unoptimized={
                          imageSrc === "/images/placeholder-product.svg" ||
                          imageSrc.includes("r2.asia-ntb.kz") ||
                          imageSrc.includes("r2.dev")
                        }
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {isOnSale && (
                          <Badge className="bg-red-500 text-white shadow-md">
                            -{discountPercentage}%
                          </Badge>
                        )}
                        {product.is_featured && (
                          <Badge className="bg-yellow-500 text-white shadow-md">
                            ХИТ
                          </Badge>
                        )}
                        {!isInStock && (
                          <Badge variant="destructive" className="shadow-md">
                            Нет в наличии
                          </Badge>
                        )}
                      </div>

                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromWishlist(product.id);
                        }}
                        aria-label="Удалить из избранного"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {product.brands?.name && (
                        <p className="text-xs text-muted-foreground font-semibold uppercase">
                          {product.brands.name}
                        </p>
                      )}
                      
                      <Link href={`/catalog/product/${product.slug}`}>
                        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-2">
                          {product.name}
                        </h3>
                      </Link>

                      {product.short_description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.short_description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-foreground">
                            {formatPrice(finalPrice)}
                          </span>
                          {isOnSale && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.base_price)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          asChild
                          className="flex-1"
                          variant={isInStock ? "default" : "outline"}
                          disabled={!isInStock}
                        >
                          <Link href={`/catalog/product/${product.slug}`}>
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            {isInStock ? "Подробнее" : "Нет в наличии"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
