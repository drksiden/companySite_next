"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ProductImageGallery } from "./ProductImageGallery";
import { ProductCard } from "./ProductCard";
import { Loading, ProductCardSkeleton } from "@/components/ui/loading";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Heart,
  Share2,
  Award,
} from "@/components/icons/SimpleIcons";
import type { Product, SearchProductsResult } from "@/types/catalog";

interface EnhancedProductDetailPageProps {
  product: Product;
  relatedProducts?: SearchProductsResult[];
}

export function EnhancedProductDetailPage({
  product,
  relatedProducts = [],
}: EnhancedProductDetailPageProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const images =
    product.images || (product.thumbnail ? [product.thumbnail] : []);
  const isInStock = product.track_inventory
    ? (product.inventory_quantity || 0) > 0
    : true;
  const hasDiscount =
    product.is_on_sale && (product.discount_percentage || 0) > 0;
  const isNew =
    product.created_at &&
    new Date(product.created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const handleAddToWishlist = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsInWishlist(!isInWishlist);
      toast.success(
        isInWishlist
          ? "Товар удален из избранного"
          : "Товар добавлен в избранное",
      );
    } catch (error) {
      toast.error("Ошибка при добавлении в избранное");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.short_description || product.name,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована в буфер обмена");
      }
    } catch (error) {
      console.log("Share cancelled or error:", error);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU") + " ₸";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
        <a href="/" className="hover:text-foreground transition-colors">
          Главная
        </a>
        <span>/</span>
        <a href="/catalog" className="hover:text-foreground transition-colors">
          Каталог
        </a>
        {product.category && (
          <>
            <span>/</span>
            <span className="text-foreground">
              {product.category?.name || "Без категории"}
            </span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Image Gallery */}
        <div className="relative">
          <ProductImageGallery
            images={images}
            productName={product.name}
            className="sticky top-4"
          />

          {/* Product Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            {hasDiscount && (
              <Badge
                variant="destructive"
                className="font-bold text-lg px-3 py-1"
              >
                -{product.discount_percentage}%
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold">
                Новинка
              </Badge>
            )}
            {product.is_featured && (
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                <Award className="h-3 w-3 mr-1" />
                Хит
              </Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground leading-tight">
                  {product.name}
                </h1>
                {product.brand?.name && (
                  <p className="text-xl text-muted-foreground mt-2 font-medium">
                    {product.brand.name}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleShare}
                className="shrink-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {product.sku && (
                <Badge variant="outline" className="text-sm">
                  Артикул: {product.sku}
                </Badge>
              )}
            </div>
          </div>

          {/* Price and Stock */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-baseline gap-4">
                  {hasDiscount && product.base_price && (
                    <span className="text-2xl text-muted-foreground line-through">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-foreground">
                    {product.formatted_price ||
                      formatPrice(product.final_price || 0)}
                  </span>
                  {hasDiscount && (
                    <Badge variant="destructive" className="text-lg px-2">
                      Скидка{" "}
                      {hasDiscount
                        ? formatPrice(
                            (product.base_price || 0) -
                              (product.final_price || 0),
                          )
                        : ""}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {isInStock ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">В наличии</span>
                      {product.track_inventory &&
                        product.inventory_quantity && (
                          <span className="text-muted-foreground">
                            ({product.inventory_quantity} шт.)
                          </span>
                        )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Под заказ (3-5 дней)</span>
                    </div>
                  )}
                </div>

                {/* Wishlist button */}
                <div className="flex justify-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleAddToWishlist}
                    size="lg"
                    className="px-6 py-6"
                    disabled={isLoading}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5 mr-2",
                        isInWishlist
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground",
                      )}
                    />
                    {isInWishlist
                      ? "Удалить из избранного"
                      : "Добавить в избранное"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Short Description */}
          {product.short_description && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Краткое описание</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card className="mb-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="description" className="text-base">
              Описание
            </TabsTrigger>
            <TabsTrigger value="specifications" className="text-base">
              Характеристики
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {product.description ? (
                <MarkdownContent
                  content={product.description}
                  variant="product"
                  className="mb-8"
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Описание не указано</p>
                </div>
              )}

              {product.technical_description && (
                <div className="mt-8">
                  <Separator className="mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Техническое описание
                  </h3>
                  <MarkdownContent
                    content={product.technical_description}
                    variant="product"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="p-8">
            <div className="max-w-4xl mx-auto space-y-8">
              {product.specifications &&
              Object.keys(product.specifications).length > 0 ? (
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    Основные характеристики
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-base font-semibold">
                          Характеристика
                        </TableHead>
                        <TableHead className="text-base font-semibold">
                          Значение
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="font-medium text-foreground py-4">
                              {key}
                            </TableCell>
                            <TableCell className="text-muted-foreground py-4">
                              {String(value)}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Характеристики не указаны
                  </p>
                </div>
              )}

              {/* Physical characteristics */}
              {(product.weight || product.dimensions) && (
                <div>
                  <Separator className="mb-6" />
                  <h3 className="text-xl font-bold text-foreground mb-6">
                    Физические характеристики
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 text-base font-semibold">
                          Параметр
                        </TableHead>
                        <TableHead className="text-base font-semibold">
                          Значение
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.weight && (
                        <TableRow>
                          <TableCell className="font-medium text-foreground py-4">
                            Вес
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4">
                            {product.weight} кг
                          </TableCell>
                        </TableRow>
                      )}
                      {product.dimensions && (
                        <>
                          {product.dimensions.length && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground py-4">
                                Длина
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.length} см
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.width && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground py-4">
                                Ширина
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.width} см
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.height && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground py-4">
                                Высота
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.height} см
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-foreground">
              Похожие товары
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.length > 0
                ? relatedProducts
                    .slice(0, 4)
                    .map((relatedProduct) => (
                      <ProductCard
                        key={relatedProduct.id}
                        product={relatedProduct}
                        variant="grid"
                        showQuickView={false}
                        showWishlist={true}
                        onQuickView={() => {}}
                        onAddToWishlist={() => {}}
                        onAddToCart={() => {}}
                      />
                    ))
                : Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EnhancedProductDetailPage;
