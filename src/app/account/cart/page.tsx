"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Plus, Minus, X, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CatalogProduct } from "@/lib/services/catalog";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

interface CartItem {
  productId: string;
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<(CatalogProduct & { quantity: number })[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем корзину из localStorage
  const loadCart = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalog-cart');
      const cartData = saved ? JSON.parse(saved) : {};
      const items: CartItem[] = Object.entries(cartData).map(([productId, quantity]) => ({
        productId,
        quantity: quantity as number,
      }));
      setCart(items);
      return items;
    }
    return [];
  }, []);

  // Загружаем данные товаров
  const loadProducts = useCallback(async (items: CartItem[]) => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const productPromises = items.map(async (item) => {
        const response = await fetch(`/api/products/by-id/${item.productId}`);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error("Failed to fetch product");
        }
        const result = await response.json();
        if (result.success && result.product) {
          return { ...result.product, quantity: item.quantity };
        }
        return null;
      });
      
      const results = await Promise.allSettled(productPromises);
      
      const loadedProducts = results
        .filter((result): result is PromiseFulfilledResult<CatalogProduct & { quantity: number }> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      setProducts(loadedProducts);
    } catch (error) {
      console.error('Error loading cart products:', error);
      toast.error("Ошибка загрузки корзины");
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем данные при монтировании
  useEffect(() => {
    const items = loadCart();
    loadProducts(items);
  }, [loadCart, loadProducts]);

  // Обновление количества товара
  const updateQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalog-cart');
      const cartData = saved ? JSON.parse(saved) : {};
      cartData[productId] = newQuantity;
      localStorage.setItem('catalog-cart', JSON.stringify(cartData));
      
      setCart(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, quantity: newQuantity } : p
      ));
      
      // Отправляем событие для обновления счетчика
      const newCount = Object.values(cartData).reduce((sum: number, qty: any) => sum + qty, 0);
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { count: newCount } 
      }));
      
      toast.success("Количество обновлено");
    }
  }, []);

  // Удаление из корзины
  const removeFromCart = useCallback((productId: string) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('catalog-cart');
      const cartData = saved ? JSON.parse(saved) : {};
      delete cartData[productId];
      localStorage.setItem('catalog-cart', JSON.stringify(cartData));
      
      setCart(prev => prev.filter(item => item.productId !== productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      // Отправляем событие для обновления счетчика
      const newCount = Object.values(cartData).reduce((sum: number, qty: any) => sum + qty, 0);
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { count: newCount } 
      }));
      
      toast.success("Товар удален из корзины");
    }
  }, []);

  // Очистка корзины
  const clearCart = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('catalog-cart');
      setCart([]);
      setProducts([]);
      
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { count: 0 } 
      }));
      
      toast.success("Корзина очищена");
    }
  }, []);

  const getImageSrc = (product: CatalogProduct): string => {
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

  const subtotal = products.reduce((sum, product) => {
    const finalPrice = product.sale_price || product.base_price;
    return sum + (finalPrice * product.quantity);
  }, 0);

  const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);

  const breadcrumbItems = [
    { name: "Главная", url: "/" },
    { name: "Личный кабинет", url: "/account" },
    { name: "Корзина", url: "/account/cart" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Вернуться в каталог
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Корзина</h1>
          <p className="text-muted-foreground mt-2">
            {totalItems > 0 
              ? `В корзине ${totalItems} ${totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}`
              : 'Корзина пуста'
            }
          </p>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Корзина пуста</h2>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Добавьте товары в корзину для оформления заказа
              </p>
              <Button asChild>
                <Link href="/catalog">Перейти в каталог</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Товары в корзине</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Очистить корзину
                </Button>
              </div>

              {products.map((product) => {
                const imageSrc = getImageSrc(product);
                const finalPrice = product.sale_price || product.base_price;
                const isOnSale = !!(product.sale_price && product.sale_price < product.base_price);
                const itemTotal = finalPrice * product.quantity;

                return (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Link
                          href={`/catalog/product/${product.slug}`}
                          className="relative shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted"
                        >
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className="object-contain p-2"
                            sizes="96px"
                            quality={80}
                            unoptimized={
                              imageSrc === "/images/placeholder-product.svg" ||
                              imageSrc.includes("r2.asia-ntb.kz") ||
                              imageSrc.includes("r2.dev")
                            }
                          />
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Link href={`/catalog/product/${product.slug}`}>
                                <h3 className="text-lg font-semibold hover:text-primary transition-colors mb-1">
                                  {product.name}
                                </h3>
                              </Link>
                              
                              {product.brands?.name && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {product.brands.name}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg font-bold text-foreground">
                                  {formatPrice(finalPrice)}
                                </span>
                                {isOnSale && (
                                  <>
                                    <span className="text-sm text-muted-foreground line-through">
                                      {formatPrice(product.base_price)}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                      Скидка
                                    </Badge>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 border rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                    aria-label="Уменьшить количество"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm font-medium w-10 text-center">
                                    {product.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                    aria-label="Увеличить количество"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(product.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Удалить
                                </Button>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground mb-1">Итого</p>
                              <p className="text-xl font-bold text-foreground">
                                {formatPrice(itemTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Итоговая информация */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Итого</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Товаров:</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Промежуточный итог:</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Итого:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  
                  <Button asChild className="w-full" size="lg">
                    <Link href="/contacts">
                      Оформить заказ
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link href="/catalog">
                      Продолжить покупки
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

