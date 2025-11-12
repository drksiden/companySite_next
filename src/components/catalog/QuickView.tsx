"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchProductsResult } from "@/types/catalog";

interface QuickViewProps {
  product: SearchProductsResult | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: SearchProductsResult) => void;
  onAddToWishlist?: (product: SearchProductsResult) => void;
}

export function QuickView({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
}: QuickViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  if (!product) return null;

  const images =
    product.images || (product.thumbnail ? [product.thumbnail] : []);
  const isInStock = (product.inventory_quantity || 0) > 0;
  const hasDiscount =
    product.is_on_sale && (product.discount_percentage || 0) > 0;
  const isNew =
    product.created_at &&
    new Date(product.created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const handleAddToCart = () => {
    onAddToCart?.(product);
    onClose();
  };

  const handleAddToWishlist = () => {
    setIsInWishlist(!isInWishlist);
    onAddToWishlist?.(product);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Быстрый просмотр товара</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
          {/* Image Section */}
          <div className="relative bg-muted aspect-square md:aspect-auto">
            {images.length > 0 && !imageError ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={handleImageError}
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={nextImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {images.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentImageIndex
                              ? "bg-white"
                              : "bg-white/50",
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Нет изображения</p>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <Badge variant="destructive" className="font-bold">
                  -{product.discount_percentage || 0}%
                </Badge>
              )}
              {isNew && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Новинка
                </Badge>
              )}
              {product.is_featured && (
                <Badge
                  variant="default"
                  className="bg-yellow-100 text-yellow-800"
                >
                  Хит
                </Badge>
              )}
            </div>

            {/* Close Button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content Section */}
          <div className="flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {/* Header */}
                <div>
                  <h2 className="text-xl font-bold text-foreground line-clamp-2">
                    {product.name}
                  </h2>
                  {product.brand_name && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.brand_name}
                    </p>
                  )}
                  {product.sku && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Артикул: {product.sku}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {hasDiscount && product.base_price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.base_price.toLocaleString("ru-RU")} ₸
                      </span>
                    )}
                    <span className="text-2xl font-bold text-foreground">
                      {product.formatted_price ||
                        `${(product.final_price || product.base_price || 0).toLocaleString("ru-RU")} ₸`}
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="flex items-center gap-2">
                    {isInStock ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />В наличии
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Нет в наличии
                      </Badge>
                    )}

                    {product.inventory_quantity &&
                      product.inventory_quantity <= 5 &&
                      isInStock && (
                        <span className="text-sm text-orange-600">
                          Осталось: {product.inventory_quantity} шт.
                        </span>
                      )}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {product.short_description && (
                  <div>
                    <h3 className="font-medium text-foreground mb-2">
                      Описание
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {product.short_description}
                    </p>
                  </div>
                )}

                {/* Specifications */}
                {product.specifications &&
                  Object.keys(product.specifications).length > 0 && (
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        Характеристики
                      </h3>
                      <div className="space-y-1">
                        {Object.entries(product.specifications)
                          .slice(0, 5)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {key}:
                              </span>
                              <span className="text-foreground font-medium">
                                {String(value)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Category */}
                {product.category_name && (
                  <div>
                    <h3 className="font-medium text-foreground mb-1">
                      Категория
                    </h3>
                    <Badge variant="outline">{product.category_name}</Badge>
                  </div>
                )}

                {/* View Full Details Link */}
                <div className="pt-4">
                  <Link href={`/catalog/product/${product.slug}`}>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={onClose}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Посмотреть все детали
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollArea>

            {/* Actions Footer */}
            <div className="border-t p-6 space-y-3">
              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToWishlist}
                  className="flex-1"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 mr-2",
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground",
                    )}
                  />
                  {isInWishlist ? "В избранном" : "В избранное"}
                </Button>

                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Поделиться
                </Button>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInStock ? "Добавить в корзину" : "Товара нет в наличии"}
              </Button>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground text-center">
                {isInStock
                  ? "Быстрая доставка • Гарантия качества"
                  : "Уведомим о поступлении товара"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
