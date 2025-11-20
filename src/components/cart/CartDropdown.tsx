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
import { ShoppingBag, X, Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CatalogProduct } from "@/lib/services/catalog";

interface CartItem {
  productId: string;
  quantity: number;
}

interface CartDropdownProps {
  cartCount: number;
}

export function CartDropdown({ cartCount }: CartDropdownProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<(CatalogProduct & { quantity: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { count: Object.values(cartData).reduce((sum: number, qty: any) => sum + qty, 0) } 
      }));
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
      
      toast.success("Удалено из корзины");
    }
  }, []);

  // Загружаем при открытии
  useEffect(() => {
    if (open) {
      const items = loadCart();
      loadProducts(items);
    }
  }, [open, loadCart, loadProducts]);

  // Слушаем обновления корзины
  useEffect(() => {
    const handleCartUpdate = () => {
      if (open) {
        const items = loadCart();
        loadProducts(items);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [open, loadCart, loadProducts]);

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

  const totalPrice = products.reduce((sum, product) => {
    const finalPrice = product.sale_price || product.base_price;
    return sum + (finalPrice * product.quantity);
  }, 0);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-foreground hover:text-primary"
          aria-label="Корзина"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {cartCount > 99 ? '99+' : cartCount}
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
            <span>Корзина</span>
            {cartCount > 0 && (
              <Badge variant="secondary">{cartCount}</Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">
              Корзина пуста
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Добавьте товары в корзину для оформления заказа
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        ) : (
          <>
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
                          quality={75}
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
                          <p className="text-xs text-muted-foreground mb-2">
                            {product.brands.name}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
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
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 border rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                aria-label="Уменьшить количество"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {product.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                aria-label="Увеличить количество"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => removeFromCart(product.id)}
                              aria-label="Удалить из корзины"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-1 text-xs text-muted-foreground">
                          Итого: {formatPrice(finalPrice * product.quantity)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            
            <div className="px-4 py-3 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Итого:</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              
              <DropdownMenuSeparator />
              
              <Button asChild className="w-full" size="sm">
                <Link href="/contacts" onClick={() => setOpen(false)}>
                  Оформить заказ
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full" size="sm">
                <Link href="/account/cart" onClick={() => setOpen(false)}>
                  Посмотреть корзину
                </Link>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

