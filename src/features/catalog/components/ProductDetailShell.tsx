"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Heart, Share2, ArrowLeft, FileText, Download, ExternalLink, Zap } from "lucide-react";
import { CatalogProduct } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { HtmlContent } from "@/components/ui/html-content";
import ProductCard from "@/features/catalog/components/ProductCard";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDetailShellProps {
  product: CatalogProduct;
  relatedProducts?: any[];
}

export default function ProductDetailShell({
  product,
  relatedProducts = [],
}: ProductDetailShellProps) {
  const [quantity, setQuantity] = useState(1);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  const finalPrice = product.sale_price || product.base_price;
  const isOnSale = !!(
    product.sale_price && product.sale_price < product.base_price
  );
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.base_price - product.sale_price!) / product.base_price) * 100,
      )
    : 0;

  const isInStock = product.inventory_quantity > 0;

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.short_description || `Посмотрите на ${product.name}`,
      url: window.location.href,
    };

    // Проверяем поддержку Web Share API
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        // Не показываем toast для успешного sharing через нативный интерфейс
      } catch (error) {
        // Если пользователь отменил sharing, не показываем ошибку
        if ((error as Error).name !== "AbortError") {
          toast.error("Не удалось поделиться контентом");
        }
      }
    } else {
      // Fallback: копируем ссылку в буфер обмена
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована в буфер обмена!");
      } catch (error) {
        // Fallback для старых браузеров
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand("copy");
          toast.success("Ссылка скопирована в буфер обмена!");
        } catch (err) {
          toast.error("Не удалось скопировать ссылку");
        }

        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link
          href="/catalog"
          className="hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Каталог
        </Link>
        {product.categories && (
          <>
            <span>/</span>
            <span>{product.categories.name}</span>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ProductImageGallery images={images} productName={product.name} />

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                {/* <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button> */}
              </div>
            </div>

            {product.brands && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Бренд:</span>
                <Link
                  href={`/catalog?brands=${product.brands.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {product.brands.name}
                </Link>
              </div>
            )}

            {product.sku && (
              <p className="text-sm text-muted-foreground">
                Артикул: {product.sku}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(finalPrice, "₸")}
              </span>
              {isOnSale && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.base_price, "₸")}
                </span>
              )}
            </div>
            {isOnSale && (
              <p className="text-sm text-green-600 font-medium">
                Экономия: {formatPrice(product.base_price - finalPrice, "₸")} (-
                {discountPercentage}%)
              </p>
            )}
          </div>

          {/* Stock Status */}
          {/* <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`}
            />
            <span
              className={`font-medium ${isInStock ? "text-green-600" : "text-red-600"}`}
            >
              {isInStock
                ? `В наличии (${product.inventory_quantity} шт.)`
                : "Нет в наличии"}
            </span>
          </div> */}

          {/* Short Description */}
          {product.short_description && (
            <div className="space-y-2">
              <p className="text-muted-foreground leading-relaxed">
                {product.short_description}
              </p>
            </div>
          )}

          {/* Additional Information */}
          {(product as any).technical_description && (
            <div className="space-y-2">
              <HtmlContent
                content={(product as any).technical_description}
                variant="product"
              />
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Separator className="mb-6" />
        <Card>
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
            </TabsContent>

            <TabsContent
              value="specifications"
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {/* Новый формат specifications (массив или объект с rows) */}
              {(() => {
                let specsRows: any[] = [];
                let specsDescription = "";
                
                // Проверяем новый формат: объект с rows и description
                if (typeof product.specifications === 'object' && !Array.isArray(product.specifications) && product.specifications !== null && 'rows' in product.specifications) {
                  specsRows = (product.specifications as any).rows || [];
                  specsDescription = (product.specifications as any).description || "";
                }
                // Проверяем, это массив строк (новая структура без description)
                else if (Array.isArray(product.specifications) && product.specifications.length > 0) {
                  specsRows = product.specifications as any[];
                  specsDescription = "";
                }
                
                if (specsRows.length > 0) {
                  return (
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
                            {specsRows.map((spec: any, index: number) => {
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
                      
                      {/* HTML описание спецификаций */}
                      {specsDescription && (
                        <div className="mt-6">
                          <HtmlContent
                            content={specsDescription}
                            variant="product"
                          />
                        </div>
                      )}
                      
                      {/* Disclaimer */}
                      <div className="mt-6 space-y-4">
                        <Separator />
                        <p className="font-bold text-sm text-muted-foreground">
                          Технические характеристики продукции, представленной в каталоге, носят сугубо информативный характер, могут быть изменены без уведомления и не заменяют консультацию специалиста
                        </p>
                      </div>
                    </div>
                  );
                } else if (product.specifications &&
                  typeof product.specifications === "object" &&
                  !Array.isArray(product.specifications) &&
                  !('rows' in product.specifications) &&
                  Object.keys(product.specifications).length > 0) {
                  return (
                    // Старый формат (объект)
                    <div className="space-y-6">
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
                      
                      {/* Disclaimer */}
                      <div className="mt-6 space-y-4">
                        <Separator />
                        <p className="font-bold text-sm text-muted-foreground">
                          Технические характеристики продукции, представленной в каталоге, носят сугубо информативный характер, могут быть изменены без уведомления и не заменяют консультацию специалиста
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📋</span>
                      </div>
                      <p className="text-muted-foreground text-lg">
                        Характеристики не указаны
                      </p>
                    </div>
                  );
                }
              })()}
            </TabsContent>

            <TabsContent
              value="documents"
              className="p-4 sm:p-6 space-y-4 sm:space-y-6"
            >
              {(product as any).documents && Array.isArray((product as any).documents) && (product as any).documents.length > 0 ? (
                <div className="space-y-4">
                  {(product as any).documents.map((docGroup: any, groupIndex: number) => {
                    // Проверяем, это новый формат с группами или старый
                    const isGroupFormat = docGroup && typeof docGroup === 'object' && 'title' in docGroup && 'documents' in docGroup;
                    
                    if (isGroupFormat) {
                      // Новый формат с группами
                      const groupTitle = docGroup.title || "Документы";
                      const groupDocs = Array.isArray(docGroup.documents) ? docGroup.documents : [];
                      
                      if (groupDocs.length === 0) return null;
                      
                      return (
                        <div key={groupIndex} className="space-y-2">
                          {groupTitle && (
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {groupTitle}
                            </h3>
                          )}
                          <div className="space-y-2">
                            {groupDocs.map((doc: any, docIndex: number) => (
                              <div
                                key={docIndex}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                              >
                                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
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
                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
                        </div>
                      );
                    } else {
                      // Старый формат - простой массив документов
                      return (
                        <div
                          key={groupIndex}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
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
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
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
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Похожие товары</h2>
            {product.categories && (
              <Button variant="outline" asChild>
                <Link href={`/catalog?category=${product.categories.id}`}>
                  Смотреть все
                </Link>
              </Button>
            )}
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: relatedProducts.length > 4,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {relatedProducts.map((relatedProduct, index) => (
                <CarouselItem
                  key={relatedProduct.id}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"
                >
                  <div className="h-full">
                    <ProductCard
                      product={relatedProduct as CatalogProduct}
                      priority={index < 4}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {relatedProducts.length > 4 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-12" />
                <CarouselNext className="hidden md:flex -right-12" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
}
