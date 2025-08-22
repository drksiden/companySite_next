"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { CatalogProduct } from "@/lib/services/catalog";

interface ProductCardProps {
  product: CatalogProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Safe image handling
  const imageSrc =
    product.thumbnail && product.thumbnail.trim() !== ""
      ? product.thumbnail
      : "/placeholder.jpg";

  const finalPrice = product.sale_price || product.base_price;
  const isOnSale = !!(
    product.sale_price && product.sale_price < product.base_price
  );
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.base_price - product.sale_price!) / product.base_price) * 100,
      )
    : 0;

  const isInStock = product.track_inventory
    ? product.inventory_quantity > 0
    : true;

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("kk-KZ")} ₸`;
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Add to cart:", product.id);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      <Link href={`/catalog/product/${product.slug}`}>
        <div className="relative">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {imageSrc !== "/placeholder.jpg" && !imageError ? (
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                onError={handleImageError}
                sizes="300px"
                quality={75}
              />
            ) : (
              <Image
                src="/placeholder.jpg"
                alt={`${product.name} - изображение товара`}
                fill
                className="object-cover transition-all duration-300 group-hover:scale-105"
                sizes="300px"
                quality={60}
              />
            )}

            {/* Overlay with description on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-all duration-300 flex items-end">
              <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {product.short_description && (
                  <p className="text-sm leading-relaxed line-clamp-3">
                    {product.short_description}
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons - top right */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleWishlistToggle}
                className={cn(
                  "h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-lg",
                  isWishlisted && "text-red-500",
                )}
              >
                <Heart
                  className={cn("h-4 w-4", isWishlisted && "fill-current")}
                />
              </Button>

              {isInStock && (
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="h-9 w-9 p-0 shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Badges - top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {isOnSale && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-lg">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && (
                <Badge variant="secondary" className="shadow-lg">
                  ХИТ
                </Badge>
              )}
              {!isInStock && (
                <Badge variant="destructive" className="shadow-lg">
                  Нет в наличии
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Brand */}
              {product.brands?.name && (
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {product.brands.name}
                </p>
              )}

              {/* Title */}
              <h3 className="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              {/* Category */}
              {product.categories?.name && (
                <p className="text-sm text-muted-foreground">
                  {product.categories.name}
                </p>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(finalPrice)}
                  </span>
                  {isOnSale && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.base_price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock info */}
              {product.track_inventory && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${isInStock ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <span
                    className={`text-xs ${isInStock ? "text-green-600" : "text-red-600"}`}
                  >
                    {isInStock
                      ? `В наличии: ${product.inventory_quantity} шт.`
                      : "Нет в наличии"}
                  </span>
                </div>
              )}

              {/* Add to cart button - always visible at bottom */}
              {isInStock && (
                <Button
                  onClick={handleAddToCart}
                  className="w-full mt-4"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
