"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchProductsResult } from "@/types/catalog";

interface ProductCardProps {
  product: SearchProductsResult;
  variant?: "grid" | "list";
  showQuickView?: boolean;
  showWishlist?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  variant = "grid",
  showQuickView = false,
  showWishlist = false,
  className,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("ru-RU")} ₸`;
  };

  const discountPercentage =
    product.is_on_sale && product.base_price && product.sale_price
      ? Math.round(
          ((product.base_price - product.sale_price) / product.base_price) *
            100,
        )
      : 0;

  const isInStock = product.inventory_quantity > 0;

  if (variant === "list") {
    return (
      <Card
        className={cn(
          "flex flex-row overflow-hidden transition-shadow hover:shadow-lg",
          className,
        )}
      >
        <div className="relative w-48 h-32 shrink-0">
          {product.thumbnail && !imageError ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Нет фото</span>
            </div>
          )}
          {product.is_on_sale && discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              ТОП
            </Badge>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <Link
                href={`/product/${product.slug}`}
                className="hover:underline"
              >
                <h3 className="text-lg font-semibold line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {showWishlist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="shrink-0 ml-2"
                >
                  <Heart
                    className={cn(
                      "w-4 h-4",
                      isWishlisted && "fill-red-500 text-red-500",
                    )}
                  />
                </Button>
              )}
            </div>

            {product.brand && (
              <Badge variant="secondary" className="mb-2">
                {product.brand.name}
              </Badge>
            )}

            {product.short_description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.short_description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {product.is_on_sale && product.base_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.base_price)}
                  </span>
                )}
                <span className="text-xl font-bold text-primary">
                  {formatPrice(product.final_price || product.base_price)}
                </span>
              </div>
              {!isInStock && (
                <Badge variant="destructive" className="w-fit mt-1">
                  Нет в наличии
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" disabled={!isInStock} className="shrink-0">
                <ShoppingCart className="w-4 h-4 mr-1" />
                {isInStock ? "В корзину" : "Нет в наличии"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-shadow hover:shadow-lg",
        className,
      )}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full overflow-hidden">
          {product.thumbnail && !imageError ? (
            <Image
              src={product.thumbnail}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Нет фото</span>
            </div>
          )}

          {product.is_on_sale && discountPercentage > 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discountPercentage}%
            </Badge>
          )}

          {product.is_featured && (
            <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              ТОП
            </Badge>
          )}

          {showWishlist && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart
                className={cn(
                  "w-4 h-4",
                  isWishlisted && "fill-red-500 text-red-500",
                )}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Link href={`/product/${product.slug}`} className="hover:underline">
          <h3 className="font-semibold line-clamp-2 mb-2">{product.name}</h3>
        </Link>

        {product.brand && (
          <Badge variant="secondary" className="mb-2">
            {product.brand.name}
          </Badge>
        )}

        {product.short_description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.short_description}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {product.is_on_sale && product.base_price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.final_price || product.base_price)}
            </span>
          </div>

          {!isInStock && (
            <Badge variant="destructive" className="w-fit">
              Нет в наличии
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" disabled={!isInStock} size="sm">
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isInStock ? "В корзину" : "Нет в наличии"}
        </Button>
      </CardFooter>
    </Card>
  );
}
