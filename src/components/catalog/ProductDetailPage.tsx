"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ShoppingCart,
  Star,
  Share2,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Plus,
  Minus,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { toast } from "sonner";
import type { Product, SearchProductsResult } from "@/types/catalog";

interface ProductDetailPageProps {
  product: Product;
  relatedProducts?: SearchProductsResult[];
}

export function ProductDetailPage({
  product,
  relatedProducts = [],
}: ProductDetailPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const images =
    product.images || (product.thumbnail ? [product.thumbnail] : []);
  const isInStock = (product.inventory_quantity || 0) > 0;
  const hasDiscount =
    product.is_on_sale && (product.discount_percentage || 0) > 0;
  const isNew =
    product.created_at &&
    new Date(product.created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const handleImageError = () => {
    setImageError(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    toast.success(`${product.name} добавлен в корзину`);
  };

  const handleAddToWishlist = () => {
    setIsInWishlist(!isInWishlist);
    toast.success(
      isInWishlist
        ? "Товар удален из избранного"
        : "Товар добавлен в избранное",
    );
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product.inventory_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      toast.error("Пожалуйста, напишите отзыв");
      return;
    }
    toast.success("Отзыв отправлен на модерацию");
    setReviewText("");
    setRating(5);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
            {images.length > 0 && !imageError ? (
              <Image
                src={images[currentImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                onError={handleImageError}
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Нет изображения</p>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <Badge variant="destructive" className="font-bold">
                  -{product.discount_percentage}%
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
                  <Zap className="h-3 w-3 mr-1" />
                  Хит
                </Badge>
              )}
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                    index === currentImageIndex
                      ? "border-blue-500"
                      : "border-transparent hover:border-gray-300",
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            {product.brand?.name && (
              <p className="text-lg text-gray-600">{product.brand.name}</p>
            )}
            {product.sku && (
              <p className="text-sm text-gray-500 mt-1">
                Артикул: {product.sku}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {hasDiscount && product.base_price && (
                <span className="text-xl text-gray-500 line-through">
                  {product.base_price.toLocaleString("ru-RU")} ₸
                </span>
              )}
              <span className="text-3xl font-bold text-gray-900">
                {product.formatted_price ||
                  `${(product.final_price || 0).toLocaleString("ru-RU")} ₸`}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              {isInStock ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />В наличии
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
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

          {/* Short Description */}
          {product.short_description && (
            <p className="text-gray-600 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Количество</Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="px-3 py-2 h-10 hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    !isInStock || quantity >= (product.inventory_quantity || 0)
                  }
                  className="px-3 py-2 h-10 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {isInStock &&
                product.inventory_quantity &&
                product.inventory_quantity <= 10 && (
                  <span className="text-sm text-orange-600">
                    Максимум {product.inventory_quantity} шт.
                  </span>
                )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="flex-1"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isInStock ? "Добавить в корзину" : "Товара нет в наличии"}
              </Button>

              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                size="lg"
                className="px-4"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isInWishlist
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600",
                  )}
                />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Бесплатная доставка
                </p>
                <p className="text-xs text-green-600">От 50 000 ₸</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Гарантия</p>
                <p className="text-xs text-blue-600">12 месяцев</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Возврат</p>
                <p className="text-xs text-purple-600">14 дней</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card className="mb-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specifications">Характеристики</TabsTrigger>
            <TabsTrigger value="reviews">Отзывы</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-6">
            <div className="space-y-4">
              {product.description ? (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Описание не указано</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="p-6">
            <div className="space-y-4">
              {product.specifications &&
              Object.keys(product.specifications).length > 0 ? (
                <div className="grid gap-3">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-gray-600 font-medium">{key}</span>
                        <span className="text-gray-900">{String(value)}</span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Характеристики не указаны</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="p-6">
            <div className="space-y-6">
              {/* Review Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Оставить отзыв</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Оценка
                    </Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star
                            className={cn(
                              "h-5 w-5",
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="review-text"
                      className="text-sm font-medium"
                    >
                      Отзыв
                    </Label>
                    <Textarea
                      id="review-text"
                      placeholder="Поделитесь своим мнением о товаре..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>

                  <Button onClick={handleSubmitReview}>Отправить отзыв</Button>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="space-y-4">
                <p className="text-gray-500 text-center py-8">
                  Отзывов пока нет. Будьте первым!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Похожие товары</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  variant="grid"
                  showQuickView={true}
                  showWishlist={true}
                  onQuickView={() => {}}
                  onAddToWishlist={() => {}}
                  onAddToCart={() => {}}
                />
              ))}
            </div>

            {relatedProducts.length > 4 && (
              <div className="text-center mt-6">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Посмотреть все похожие товары
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductDetailPage;
