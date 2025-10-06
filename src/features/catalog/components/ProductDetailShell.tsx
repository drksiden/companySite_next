"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import { CatalogProduct } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { toast } from "sonner";

interface ProductDetailShellProps {
  product: CatalogProduct;
}

export default function ProductDetailShell({
  product,
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
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground leading-relaxed">
                  {product.short_description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detailed Description */}
      {product.description && (
        <div className="mt-12 space-y-6">
          <Separator />
          <div>
            <h2 className="text-2xl font-bold mb-4">Описание товара</h2>
            <Card>
              <CardContent className="p-6">
                <div
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Specifications */}
      {product.specifications &&
        Object.keys(product.specifications).length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Характеристики</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-3">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-4 py-2 border-b border-border/50 last:border-0"
                      >
                        <span className="font-medium text-muted-foreground">
                          {key}:
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Category Info */}
      {product.categories && (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Категория</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{product.categories.name}</h3>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/catalog?category=${product.categories.id}`}>
                    Смотреть все товары
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
