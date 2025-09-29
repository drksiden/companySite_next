"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingDown, Calculator } from "lucide-react";

interface ProductPriceProps {
  finalPrice: number;
  basePrice?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
  formattedPrice?: string;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showSavings?: boolean;
  className?: string;
}

export function ProductPrice({
  finalPrice,
  basePrice,
  isOnSale = false,
  discountPercentage,
  formattedPrice,
  currency = "₸",
  size = "md",
  showSavings = true,
  className,
}: ProductPriceProps) {
  const hasDiscount = isOnSale && basePrice && basePrice > finalPrice;
  const savings = hasDiscount ? basePrice - finalPrice : 0;

  const sizeClasses = {
    sm: {
      final: "text-lg font-semibold",
      original: "text-sm",
      savings: "text-xs",
    },
    md: {
      final: "text-2xl font-bold",
      original: "text-lg",
      savings: "text-sm",
    },
    lg: {
      final: "text-3xl font-bold",
      original: "text-xl",
      savings: "text-base",
    },
    xl: {
      final: "text-4xl font-bold",
      original: "text-2xl",
      savings: "text-lg",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Цены */}
      <div className="flex items-baseline gap-3 flex-wrap">
        {hasDiscount && (
          <span className={cn("text-muted-foreground line-through font-medium", classes.original)}>
            {basePrice?.toLocaleString("ru-RU")} {currency}
          </span>
        )}

        <span className={cn(
          hasDiscount
            ? "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
            : "text-foreground",
          classes.final
        )}>
          {formattedPrice || `${finalPrice.toLocaleString("ru-RU")} ${currency}`}
        </span>

        {hasDiscount && discountPercentage && (
          <Badge variant="destructive" className="font-bold animate-pulse">
            -{discountPercentage}%
          </Badge>
        )}
      </div>

      {/* Экономия */}
      {hasDiscount && showSavings && savings > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full border border-red-200 dark:border-red-800">
            <TrendingDown className="w-4 h-4" />
            <span className={cn("font-medium", classes.savings)}>
              Экономия: {savings.toLocaleString("ru-RU")} {currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для компактного отображения цены в карточках товаров
export function ProductPriceCompact({
  finalPrice,
  basePrice,
  isOnSale = false,
  discountPercentage,
  currency = "₸",
  className,
}: Omit<ProductPriceProps, "size" | "showSavings" | "formattedPrice">) {
  const hasDiscount = isOnSale && basePrice && basePrice > finalPrice;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          {basePrice?.toLocaleString("ru-RU")} {currency}
        </span>
      )}

      <span className={cn(
        "text-lg font-bold",
        hasDiscount ? "text-primary" : "text-foreground"
      )}>
        {finalPrice.toLocaleString("ru-RU")} {currency}
      </span>

      {hasDiscount && discountPercentage && (
        <Badge variant="destructive" className="text-xs py-0 px-1.5 h-5">
          -{discountPercentage}%
        </Badge>
      )}
    </div>
  );
}

// Компонент для отображения диапазона цен (для товаров с вариантами)
export function ProductPriceRange({
  minPrice,
  maxPrice,
  currency = "₸",
  size = "md",
  className,
}: {
  minPrice: number;
  maxPrice: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-base font-medium",
    md: "text-lg font-semibold",
    lg: "text-xl font-bold",
  };

  if (minPrice === maxPrice) {
    return (
      <span className={cn(sizeClasses[size], "text-foreground", className)}>
        {minPrice.toLocaleString("ru-RU")} {currency}
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Calculator className="w-4 h-4 text-muted-foreground" />
      <span className={cn(sizeClasses[size], "text-foreground")}>
        от {minPrice.toLocaleString("ru-RU")} до {maxPrice.toLocaleString("ru-RU")} {currency}
      </span>
    </div>
  );
}
