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
import { ProductImageGallery } from "../product/ProductImageGallery";
import { ProductCard } from "./ProductCard";
import { ProductBadges, ProductStatusBadge } from "./ProductBadges";
import { ProductPrice } from "./ProductPrice";
import { Loading, ProductCardSkeleton } from "@/components/ui/loading";
import { HtmlContent } from "@/components/ui/html-content";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Heart,
  Share2,
  ShoppingCart,
  Zap,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
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
  // Определяем наличие товара с учетом track_inventory, inventory_quantity и status
  const isInStock = (() => {
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
  const hasDiscount =
    product.is_on_sale && (product.discount_percentage || 0) > 0;
  const isNew = Boolean(
    product.created_at &&
      new Date(product.created_at) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );

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
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
        {/* Image Gallery */}
        <div className="relative">
          <ProductImageGallery
            images={images}
            productName={product.name}
            className="w-full max-w-full sm:max-w-md mx-auto lg:max-w-lg"
          />

          {/* Product Badges Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <ProductBadges
              isNew={isNew}
              isFeatured={Boolean(product.is_featured)}
              isOnSale={hasDiscount}
              discountPercentage={
                product.discount_percentage
                  ? Number(product.discount_percentage)
                  : undefined
              }
              isInStock={isInStock}
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          {/* Header */}
          <div className="space-y-2 sm:space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 leading-tight">
                {product.name}
              </h1>
              {product.brand?.name && (
                <p className="text-base sm:text-lg text-muted-foreground font-medium">
                  {product.brand.name}
                </p>
              )}
            </div>
            {product.sku && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-sm text-muted-foreground">
                <span className="text-xs font-medium">Артикул:</span>
                <span className="font-mono">{product.sku}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="p-4 sm:p-6 bg-gradient-to-br from-background to-muted/30 rounded-xl border shadow-sm">
            <div className="space-y-3 sm:space-y-4">
              <ProductPrice
                finalPrice={product.final_price || 0}
                basePrice={product.base_price}
                isOnSale={hasDiscount}
                discountPercentage={product.discount_percentage}
                formattedPrice={product.formatted_price}
                size="xl"
                showSavings={true}
              />

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <ProductStatusBadge
                  isInStock={isInStock}
                  trackInventory={product.track_inventory}
                  inventoryQuantity={product.inventory_quantity}
                />
              </div>
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <div className="bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl p-4 sm:p-6 border shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Краткое описание
              </h3>
              <div className="text-muted-foreground leading-relaxed">
                {product.short_description}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                size="lg"
                className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loading size="sm" variant="spinner" />
                ) : (
                  <>
                    <Heart
                      className={cn(
                        "h-5 w-5 mr-2 transition-colors",
                        isInWishlist
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground",
                      )}
                    />
                    {isInWishlist ? "В избранном" : "В избранное"}
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                size="lg"
                className="h-10 sm:h-12 px-4 sm:px-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Поделиться
              </Button>
            </div>

            {/* Call to Action Button */}
            <Button
              size="lg"
              className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isInStock ? "Добавить в корзину" : "Заказать"}
            </Button>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Card className="mb-6 sm:mb-8 shadow-sm mx-2 sm:mx-0">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12 p-1 bg-muted/50">
            <TabsTrigger
              value="description"
              className="text-sm sm:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Описание
            </TabsTrigger>
            <TabsTrigger
              value="specifications"
              className="text-sm sm:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Характеристики
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="text-sm sm:text-base font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Документы
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="description"
            className="p-4 sm:p-6 space-y-6 sm:space-y-8"
          >
            {product.description ? (
              <div>
                <HtmlContent
                  content={product.description}
                  variant="product"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <p className="text-muted-foreground text-lg">
                  Описание не указано
                </p>
              </div>
            )}

            {product.technical_description && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Дополнительная информация
                </h3>
                <HtmlContent
                  content={product.technical_description}
                  variant="product"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="specifications"
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Новый формат specifications (массив) */}
            {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
              <div className="space-y-6">
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-1/2 font-semibold">
                          Параметр
                        </TableHead>
                        <TableHead className="w-1/2 font-semibold">Значение</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.specifications.map((spec: any, index: number) => {
                        if (spec.type === "separator") {
                          return (
                            <TableRow key={spec.id || index} className="border-t-2 border-border">
                              <TableCell colSpan={2} className="p-4">
                                <div className="flex-1 border-t"></div>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        if (spec.type === "header") {
                          return (
                            <TableRow
                              key={spec.id || index}
                              className="bg-muted/30 border-t-2 border-primary/20"
                            >
                              <TableCell
                                colSpan={2}
                                className="font-bold text-base text-foreground py-4 px-4"
                              >
                                {spec.key || "Заголовок"}
                              </TableCell>
                            </TableRow>
                          );
                        }

                        if (spec.type === "row" && spec.key && spec.value) {
                          return (
                            <TableRow
                              key={spec.id || index}
                              className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                            >
                              <TableCell className="font-medium text-foreground py-4 px-4">
                                {spec.key}
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4 px-4">
                                <HtmlContent
                                  content={String(spec.value)}
                                  variant="compact"
                                  className="[&_*]:text-muted-foreground [&_strong]:text-foreground"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return null;
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : product.specifications &&
              typeof product.specifications === "object" &&
              !Array.isArray(product.specifications) &&
              Object.keys(product.specifications).length > 0 ? (
              // Старый формат (объект)
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-1/3 font-semibold">
                        Характеристика
                      </TableHead>
                      <TableHead className="font-semibold">Значение</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(product.specifications).map(
                      ([key, value], index) => (
                        <TableRow
                          key={key}
                          className={
                            index % 2 === 0 ? "bg-background" : "bg-muted/20"
                          }
                        >
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
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-muted-foreground text-lg">
                  Характеристики не указаны
                </p>
              </div>
            )}

            {/* Physical characteristics */}
            {(product.weight || product.dimensions) && (
              <div className="space-y-4 mt-8 pt-8 border-t">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className="text-xl">📐</span>
                  Физические характеристики
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableBody>
                      {product.weight && (
                        <TableRow className="bg-muted/20">
                          <TableCell className="font-medium text-foreground w-1/3 py-4">
                            Вес
                          </TableCell>
                          <TableCell className="text-muted-foreground py-4">
                            {product.weight} г
                          </TableCell>
                        </TableRow>
                      )}
                      {product.dimensions && (
                        <>
                          {product.dimensions.length && (
                            <TableRow className="bg-background">
                              <TableCell className="font-medium text-foreground py-4">
                                Длина
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.length} мм
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.width && (
                            <TableRow className="bg-muted/20">
                              <TableCell className="font-medium text-foreground py-4">
                                Ширина
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.width} мм
                              </TableCell>
                            </TableRow>
                          )}
                          {product.dimensions.height && (
                            <TableRow className="bg-background">
                              <TableCell className="font-medium text-foreground py-4">
                                Высота
                              </TableCell>
                              <TableCell className="text-muted-foreground py-4">
                                {product.dimensions.height} мм
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="documents"
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {product.documents && Array.isArray(product.documents) && product.documents.length > 0 ? (
              <div className="space-y-6">
                {product.documents.map((docGroup: any, groupIndex: number) => {
                  // Проверяем, это новый формат с группами или старый
                  const isGroupFormat = docGroup && typeof docGroup === 'object' && 'title' in docGroup && 'documents' in docGroup;
                  
                  if (isGroupFormat) {
                    // Новый формат с группами
                    const groupTitle = docGroup.title || "Документы";
                    const groupDocs = Array.isArray(docGroup.documents) ? docGroup.documents : [];
                    
                    if (groupDocs.length === 0) return null;
                    
                    return (
                      <Card key={groupIndex} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold">
                            {groupTitle}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {groupDocs.map((doc: any, docIndex: number) => (
                              <div
                                key={docIndex}
                                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                    >
                                      {doc.title || doc.name || "Документ"}
                                      <ExternalLink className="h-4 w-4 opacity-70" />
                                    </a>
                                  </div>
                                  {doc.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {doc.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    {doc.type && (
                                      <Badge variant="outline" className="text-xs">
                                        {doc.type.split("/")[1]?.toUpperCase() || "FILE"}
                                      </Badge>
                                    )}
                                    {doc.size && (
                                      <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="flex-shrink-0"
                                >
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    // Старый формат - простой массив документов
                    return (
                      <Card key={groupIndex} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg font-bold">
                            Документы
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div
                              key={groupIndex}
                              className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <a
                                    href={docGroup.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                                  >
                                    {docGroup.name || docGroup.title || "Документ"}
                                    <ExternalLink className="h-4 w-4 opacity-70" />
                                  </a>
                                </div>
                                {docGroup.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {docGroup.description}
                                  </p>
                                )}
                                {docGroup.type && (
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {docGroup.type.split("/")[1]?.toUpperCase() || "FILE"}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className="flex-shrink-0"
                              >
                                <a
                                  href={docGroup.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Документы не загружены
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card className="shadow-sm mx-2 sm:mx-0">
          <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl text-foreground flex items-center gap-2 sm:gap-3">
              <span className="text-3xl">🔗</span>
              Похожие товары
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.length > 0
                ? relatedProducts.slice(0, 4).map((relatedProduct) => (
                    <div key={relatedProduct.id} className="group">
                      <ProductCard
                        product={relatedProduct}
                        variant="grid"
                        showQuickView={false}
                        showWishlist={true}
                        onQuickView={() => {}}
                        onAddToWishlist={() => {}}
                        onAddToCart={() => {}}
                        className="transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-md"
                      />
                    </div>
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
