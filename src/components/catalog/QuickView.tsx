"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Product, SearchProductsResult } from "@/types/catalog";

interface QuickViewProps {
  product: SearchProductsResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Загружаем полные данные о товаре
  useEffect(() => {
    if (product && isOpen) {
      setIsLoading(true);
      fetch(`/api/products/${product.slug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFullProduct(data.data);
          }
        })
        .catch((error) => {
          console.error("Failed to load product details:", error);
          toast.error("Не удалось загрузить детали товара");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [product, isOpen]);

  // Сбрасываем состояние при закрытии
  useEffect(() => {
    if (!isOpen) {
      setFullProduct(null);
      setQuantity(1);
      setSelectedImage(0);
      setIsAddingToCart(false);
    }
  }, [isOpen]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      // Здесь будет интеграция с корзиной
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Товар "${product.name}" добавлен в корзину`);
    } catch (error) {
      toast.error("Не удалось добавить товар в корзину");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(
      isInWishlist ? "Удалено из избранного" : "Добавлено в избранное",
    );
  };

  const formatPrice = (price: number, currencyCode?: string) => {
    const currency = currencyCode || "KZT";
    const symbol = currency === "KZT" ? "₸" : currency === "USD" ? "$" : "₽";
    return `${price.toLocaleString("ru-RU")} ${symbol}`;
  };

  if (!product) return null;

  const productImages = fullProduct?.images || [product.thumbnail].filter(Boolean);
  const isInStock = product.inventory_quantity > 0;
  const discountPercentage = product.discount_percentage || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Изображения */}
          <div className="relative bg-muted p-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="space-y-4">
              {/* Основное изображение */}
              <div className="relative aspect-square bg-white rounded-lg overflow-hidden">
                {productImages.length > 0 ? (
                  <Image
                    src={productImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Нет изображения
                  </div>
                )}

                {/* Бейджи */}
                <div className="absolute top-4 left-4 space-y-2">
                  {product.is_featured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      ТОП
                    </Badge>
                  )}
                  {discountPercentage > 0 && (
                    <Badge className="bg-red-500 text-white">
                      -{discountPercentage}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Миниатюры */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={cn(
                        "relative w-16 h-16 bg-white rounded border-2 overflow-hidden shrink-0 transition-colors",
                        selectedImage === index
                          ? "border-primary"
                          : "border-transparent",
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Информация о товаре */}
          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-xl font-bold text-left">
                    {product.name}
                  </DialogTitle>
                  {product.brand && (
                    <Link
                      href={`/catalog?brands=${product.brand.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {product.brand.name}
                    </Link>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleWishlist}
                  className={cn(
                    "shrink-0",
                    isInWishlist && "text-red-500",
                  )}
                >
                  <Heart className={cn("h-5 w-5", isInWishlist && "fill-current")} />
                </Button>
              </div>
            </DialogHeader>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Загрузка...</span>
              </div>
            ) : (
              <>
                {/* Цена */}
                <div className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(
                        product.final_price || product.base_price,
                        product.currency?.code,
                      )}
                    </span>
                    {product.is_on_sale && product.base_price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.base_price, product.currency?.code)}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                      isInStock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800",
                    )}
                  >
                    {isInStock ? "В наличии" : "Нет в наличии"}
                  </div>
                </div>

                {/* Краткое описание */}
                {product.short_description && (
                  <p className="text-muted-foreground">
                    {product.short_description}
                  </p>
                )}

                <Separator />

                {/* Количество и кнопки */}
                <div className="space-y-4">
                  {isInStock && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium">Количество:</label>
                      <div className="flex items-center border rounded-md">
                        <button
                          type="button"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 hover:bg-muted transition-colors"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.inventory_quantity}
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 1) {
                              setQuantity(
                                Math.min(value, product.inventory_quantity),
                              );
                            }
                          }}
                          className="w-16 px-3 py-2 text-center border-x focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(
                              Math.min(product.inventory_quantity, quantity + 1),
                            )
                          }
                          className="px-3 py-2 hover:bg-muted transition-colors"
                          disabled={quantity >= product.inventory_quantity}
                        >
                          +
                        </button>
                      </div>
                      {product.inventory_quantity <= 10 && (
                        <span className="text-xs text-amber-600">
                          Осталось: {product.inventory_quantity} шт.
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={handleAddToCart}
                      disabled={!isInStock || isAddingToCart}
                      className="w-full"
                    >
                      {isAddingToCart ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Добавление...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Добавить в корзину
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/product/${product.slug}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Подробнее
                      </Link>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Дополнительная информация */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span>Бесплатная доставка от 50 000 ₸</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span>Гарантия качества</span>
                  </div>
                </div>

                {/* Артикул */}
                {product.sku && (
                  <div className="text-xs text-muted-foreground">
                    Артикул: {product.sku}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
