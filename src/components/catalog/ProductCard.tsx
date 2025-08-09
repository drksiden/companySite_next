"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Share2,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchProductsResult } from "@/types/catalog";

interface ProductCardProps {
  product: SearchProductsResult;
  variant?: "grid" | "list" | "compact";
  showQuickView?: boolean;
  showWishlist?: boolean;
  showShare?: boolean;
  className?: string;
  priority?: boolean;
  onQuickView?: (product: SearchProductsResult) => void;
  onAddToWishlist?: (product: SearchProductsResult) => void;
  onAddToCart?: (product: SearchProductsResult) => void;
}

export function ProductCard({
  product,
  variant = "grid",
  showQuickView = true,
  showWishlist = true,
  showShare = false,
  className,
  priority = false,
  onQuickView,
  onAddToWishlist,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsInWishlist(!isInWishlist);
    onAddToWishlist?.(product);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isInStock = (product.inventory_quantity || 0) > 0;
  const hasDiscount =
    product.is_on_sale && (product.discount_percentage || 0) > 0;
  const isNew =
    product.created_at &&
    new Date(product.created_at) >
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  if (variant === "list") {
    return (
      <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
        <Card
          className={cn(
            "group relative overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300",
            !isInStock && "opacity-75",
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Image Section */}
            <div className="relative w-full sm:w-48 h-48 sm:h-32 bg-gray-50 flex-shrink-0">
              <Link href={`/product/${product.slug}`}>
                {!imageError && product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={handleImageError}
                    priority={priority}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-gray-400 text-xs">Нет изображения</div>
                  </div>
                )}
              </Link>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {hasDiscount && (
                  <Badge variant="destructive" className="text-xs">
                    -{product.discount_percentage}%
                  </Badge>
                )}
                {isNew && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800"
                  >
                    Новинка
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge
                    variant="default"
                    className="text-xs bg-yellow-100 text-yellow-800"
                  >
                    Хит
                  </Badge>
                )}
              </div>

              {/* Quick Actions */}
              {isHovered && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {showWishlist && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={handleWishlistClick}
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
                  )}
                  {showQuickView && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                      onClick={handleQuickView}
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 p-4">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-1">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {product.brand_name && (
                    <p className="text-sm text-gray-500 mt-1">
                      {product.brand_name}
                    </p>
                  )}

                  {product.short_description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {hasDiscount && product.base_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.base_price.toLocaleString("ru-RU")} ₸
                        </span>
                      )}
                      <span className="text-lg font-bold text-gray-900">
                        {product.formatted_price ||
                          `${(product.final_price || 0).toLocaleString("ru-RU")} ₸`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      {isInStock ? (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />В наличии
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-red-100 text-red-800"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Нет в наличии
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCartClick}
                    disabled={!isInStock}
                    size="sm"
                    className="shrink-0"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />В корзину
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid variant (default)
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={cn(
          "group relative overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300",
          !isInStock && "opacity-75",
          variant === "compact" && "max-w-xs",
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Link href={`/product/${product.slug}`}>
            {!imageError && product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={handleImageError}
                priority={priority}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-gray-400 text-sm">Нет изображения</div>
              </div>
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs font-bold">
                -{product.discount_percentage}%
              </Badge>
            )}
            {isNew && (
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-800"
              >
                Новинка
              </Badge>
            )}
            {product.is_featured && (
              <Badge
                variant="default"
                className="text-xs bg-yellow-100 text-yellow-800"
              >
                <Zap className="h-3 w-3 mr-1" />
                Хит
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-3 right-3 flex flex-col gap-2"
              >
                {showWishlist && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={handleWishlistClick}
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
                )}
                {showQuickView && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={handleQuickView}
                  >
                    <Eye className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
                {showShare && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-sm"
                  >
                    <Share2 className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stock Status Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white/90 text-gray-800">
                Нет в наличии
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="pb-2">
          <div className="space-y-1">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-tight">
                {product.name}
              </h3>
            </Link>

            {product.brand_name && (
              <p className="text-xs text-gray-500">{product.brand_name}</p>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-2">
          {product.short_description && variant !== "compact" && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {product.short_description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            {hasDiscount && product.base_price && (
              <span className="text-sm text-gray-500 line-through">
                {product.base_price.toLocaleString("ru-RU")} ₸
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              {product.formatted_price ||
                `${(product.final_price || 0).toLocaleString("ru-RU")} ₸`}
            </span>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mt-2">
            {isInStock ? (
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-800"
              >
                <CheckCircle className="h-3 w-3 mr-1" />В наличии
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="text-xs bg-red-100 text-red-800"
              >
                <Clock className="h-3 w-3 mr-1" />
                Под заказ
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center gap-2 w-full">
            <Button
              onClick={handleCartClick}
              disabled={!isInStock}
              size="sm"
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />В корзину
            </Button>
          </div>
        </CardFooter>

        {/* Quick View Button for Mobile */}
        {showQuickView && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-4 right-4 sm:hidden"
          >
            <Button
              size="sm"
              variant="secondary"
              className="h-9 w-9 p-0 bg-white/90 hover:bg-white shadow-sm"
              onClick={handleQuickView}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
