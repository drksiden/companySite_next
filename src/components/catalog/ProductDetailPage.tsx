"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SimpleImageGallery } from "./SimpleImageGallery";
import { ProductCard } from "./ProductCard";
import { Loading, ProductCardSkeleton } from "@/components/ui/loading";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Heart,
  Share2,
  Zap,
} from "@/components/icons/SimpleIcons";
import type { Product, SearchProductsResult } from "@/types/catalog";

interface ProductDetailPageProps {
  product: Product;
  relatedProducts?: SearchProductsResult[];
}

export function ProductDetailPage({
  product,
  relatedProducts = [],
}: ProductDetailPageProps) {
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
      // Здесь будет API запрос для добавления в избранное
      await new Promise((resolve) => setTimeout(resolve, 500)); // Имитация API запроса
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
      // Пользователь отменил шеринг или ошибка копирования
      console.log("Share cancelled or error:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Gallery */}
        <div className="relative">
          <SimpleImageGallery
            images={images}
            productName={product.name}
            className="max-w-md mx-auto lg:max-w-lg"
          />

          {/* Product Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
            {hasDiscount && (
              <Badge variant="destructive" className="font-bold">
                -{product.discount_percentage}%
              </Badge>
            )}
            {isNew && <Badge variant="secondary">Новинка</Badge>}
            {product.is_featured && <Badge variant="default">Хит</Badge>}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            {product.brand?.name && (
              <p className="text-lg text-muted-foreground">
                {product.brand.name}
              </p>
            )}
            {product.sku && (
              <p className="text-sm text-muted-foreground mt-1">
                Артикул: {product.sku}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {hasDiscount && product.base_price && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.base_price.toLocaleString("ru-RU")} ₸
                </span>
              )}
              <span className="text-3xl font-bold text-foreground">
                {product.formatted_price ||
                  `${(product.final_price || 0).toLocaleString("ru-RU")} ₸`}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-3">
              {!isInStock && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                >
                  Под заказ
                </Badge>
              )}
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <div className="bg-muted/30 rounded-lg p-4 border">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Краткое описание
              </h3>
              <MarkdownContent
                content={product.short_description}
                variant="compact"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                size="lg"
                className="px-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loading size="sm" variant="spinner" />
                ) : (
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isInWishlist
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground",
                    )}
                  />
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                size="lg"
                className="px-4"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card className="mb-8">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specifications">Характеристики</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="p-6">
            <div className="space-y-6">
              {product.description ? (
                <MarkdownContent
                  content={product.description}
                  variant="product"
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Описание не указано</p>
                </div>
              )}

              {product.technical_description && (
                <div className="mt-8">
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      Техническое описание
                    </h3>
                    <MarkdownContent
                      content={product.technical_description}
                      variant="product"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="p-6">
            <div className="space-y-4">
              {product.specifications &&
              Object.keys(product.specifications).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Характеристика</TableHead>
                      <TableHead>Значение</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <TableRow key={key}>
                          <TableCell className="font-medium text-foreground">
                            {key}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {String(value)}
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">
                  Характеристики не указаны
                </p>
              )}

              {/* Physical characteristics */}
              {(product.weight || product.dimensions) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Физические характеристики
                  </h3>
                  <Table>
                    <TableBody>
                      {product.weight && (
                        <TableRow>
                          <TableCell className="font-medium text-foreground w-1/3">
                            Вес
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {product.weight} кг
                          </TableCell>
                        </TableRow>
                      )}
                      {product.dimensions && (
                        <>
                          {product.dimensions.length && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground">
                                Длина
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.dimensions.length} см
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.width && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground">
                                Ширина
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {product.dimensions.width} см
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.height && (
                            <TableRow>
                              <TableCell className="font-medium text-foreground">
                                Высота
                              </TableCell>
                              <TableCell className="text-muted-foreground">
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
            <CardTitle className="text-xl text-foreground">
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
                : // Показываем скелетоны пока загружаются связанные товары
                  Array.from({ length: 4 }).map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProductDetailPage;
