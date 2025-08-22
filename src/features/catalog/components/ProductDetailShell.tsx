"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  Star,
  Package,
  Truck,
  Shield,
  Eye
} from "lucide-react";
import { CatalogProduct } from "@/lib/services/catalog";
import { formatPrice } from "@/lib/utils";

interface ProductDetailShellProps {
  product: CatalogProduct;
}

export default function ProductDetailShell({ product }: ProductDetailShellProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images && product.images.length > 0
    ? product.images
    : product.thumbnail
    ? [product.thumbnail]
    : [];

  const finalPrice = product.sale_price || product.base_price;
  const isOnSale = !!(product.sale_price && product.sale_price < product.base_price);
  const discountPercentage = isOnSale
    ? Math.round(((product.base_price - product.sale_price!) / product.base_price) * 100)
    : 0;

  const isInStock = product.inventory_quantity > 0;

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    console.log(`Added ${quantity} of ${product.name} to cart`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show success toast
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/catalog" className="hover:text-foreground flex items-center gap-1">
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
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {isOnSale && (
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-muted rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImageIndex === index
                          ? 'border-primary'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
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
                Экономия: {formatPrice(product.base_price - finalPrice, "₸")} (-{discountPercentage}%)
              </p>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {isInStock ? `В наличии (${product.inventory_quantity} шт.)` : 'Нет в наличии'}
            </span>
          </div>

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

          {/* Quantity & Add to Cart */}
          {isInStock && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Количество:</label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.inventory_quantity, quantity + 1))}
                    disabled={quantity >= product.inventory_quantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Добавить в корзину
              </Button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div className="text-center space-y-2">
              <Truck className="h-8 w-8 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Быстрая доставка</p>
                <p className="text-xs text-muted-foreground">По всему Казахстану</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <Shield className="h-8 w-8 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Гарантия качества</p>
                <p className="text-xs text-muted-foreground">Официальная гарантия</p>
              </div>
            </div>
            <div className="text-center space-y-2">
              <Eye className="h-8 w-8 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Просмотры</p>
                <p className="text-xs text-muted-foreground">{product.view_count}</p>
              </div>
            </div>
          </div>
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
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-bold">Характеристики</h2>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-3">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 py-2 border-b border-border/50 last:border-0">
                    <span className="font-medium text-muted-foreground">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
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
                  {product.categories.description && (
                    <p className="text-muted-foreground mt-1">{product.categories.description}</p>
                  )}
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/catalog?categories=${product.categories.id}`}>
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
