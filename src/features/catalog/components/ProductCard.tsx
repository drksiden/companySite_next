"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CatalogProduct } from "@/lib/services/catalog";
import { getOptimizedImageSrc, getPlaceholderImageUrl } from "@/lib/imageUtils";

interface ProductCardProps {
  product: CatalogProduct;
  size?: "small" | "medium" | "large";
  layout?: "grid" | "list";
  showWishlist?: boolean;
  showQuickView?: boolean;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  size = "medium",
  layout = "grid",
  showWishlist = true,
  showQuickView = true,
  showAddToCart = true,
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const imageSrc = getOptimizedImageSrc(product.thumbnail);
  const fallbackSrc = getPlaceholderImageUrl(400, 400, "Нет фото");

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
    // TODO: Implement wishlist API call
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement add to cart functionality
    console.log("Add to cart:", product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view modal
    console.log("Quick view:", product.id);
  };

  if (layout === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <Link href={`/product/${product.slug}`}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Image */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imageSrc || fallbackSrc}
                    alt={product.name}
                    fill
                    className={cn(
                      "object-cover transition-all duration-300",
                      "group-hover:scale-105",
                      imageLoading && "animate-pulse",
                    )}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageError(true);
                      setImageLoading(false);
                    }}
                    sizes="128px"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {isOnSale && (
                      <Badge className="bg-red-500 hover:bg-red-600 text-white">
                        -{discountPercentage}%
                      </Badge>
                    )}
                    {product.is_featured && (
                      <Badge variant="secondary">Хит</Badge>
                    )}
                    {!isInStock && (
                      <Badge variant="destructive">Нет в наличии</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    {product.brands?.name && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {product.brands.name}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    {product.categories?.name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.categories.name}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-4">
                    {showWishlist && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleWishlistToggle}
                        className={cn(
                          "h-8 w-8 p-0",
                          isWishlisted && "text-red-500",
                        )}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            isWishlisted && "fill-current",
                          )}
                        />
                      </Button>
                    )}
                    {showQuickView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleQuickView}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {product.short_description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.short_description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {formatPrice(finalPrice)}
                    </span>
                    {isOnSale && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(product.base_price)}
                      </span>
                    )}
                  </div>

                  {showAddToCart && isInStock && (
                    <Button
                      size="sm"
                      onClick={handleAddToCart}
                      className="ml-4"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Grid layout
  const cardClasses = {
    small: "w-full",
    medium: "w-full",
    large: "w-full",
  };

  const imageClasses = {
    small: "aspect-square",
    medium: "aspect-square",
    large: "aspect-[4/3]",
  };

  const titleClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 overflow-hidden",
        cardClasses[size],
      )}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative">
          {/* Image */}
          <div
            className={cn(
              "relative overflow-hidden bg-muted",
              imageClasses[size],
            )}
          >
            <Image
              src={imageSrc || fallbackSrc}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-all duration-300",
                "group-hover:scale-105",
                imageLoading && "animate-pulse",
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              sizes={
                size === "small"
                  ? "200px"
                  : size === "medium"
                    ? "300px"
                    : "400px"
              }
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {showWishlist && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleWishlistToggle}
                  className={cn(
                    "h-8 w-8 p-0 bg-white/90 hover:bg-white",
                    isWishlisted && "text-red-500",
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", isWishlisted && "fill-current")}
                  />
                </Button>
              )}
              {showQuickView && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickView}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOnSale && (
                <Badge className="bg-red-500 hover:bg-red-600 text-white">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.is_featured && <Badge variant="secondary">Хит</Badge>}
              {!isInStock && <Badge variant="destructive">Нет в наличии</Badge>}
            </div>

            {/* Add to Cart - Bottom overlay */}
            {showAddToCart && isInStock && (
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <Button onClick={handleAddToCart} className="w-full" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <CardContent className="p-3">
            <div className="space-y-2">
              {product.brands?.name && size !== "small" && (
                <p className="text-xs text-muted-foreground">
                  {product.brands.name}
                </p>
              )}

              <h3
                className={cn(
                  "font-semibold line-clamp-2 leading-tight",
                  titleClasses[size],
                )}
              >
                {product.name}
              </h3>

              {product.categories?.name && size === "large" && (
                <p className="text-sm text-muted-foreground">
                  {product.categories.name}
                </p>
              )}

              {product.short_description && size === "large" && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.short_description}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <span
                  className={cn(
                    "font-bold",
                    size === "small" ? "text-sm" : "text-lg",
                  )}
                >
                  {formatPrice(finalPrice)}
                </span>
                {isOnSale && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.base_price)}
                  </span>
                )}
              </div>

              {product.track_inventory && size !== "small" && (
                <p className="text-xs text-muted-foreground">
                  {isInStock
                    ? `В наличии: ${product.inventory_quantity} шт.`
                    : "Нет в наличии"}
                </p>
              )}
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
