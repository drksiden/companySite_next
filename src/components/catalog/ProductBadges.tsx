"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Star, Clock, Percent } from "lucide-react";

interface ProductBadgesProps {
  isNew?: boolean;
  isFeatured?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  isInStock?: boolean;
  className?: string;
}

export function ProductBadges({
  isNew,
  isFeatured,
  isOnSale,
  discountPercentage,
  isInStock,
  className,
}: ProductBadgesProps) {
  const badges = [];

  // Скидка (приоритет 1)
  if (isOnSale && discountPercentage && discountPercentage > 0) {
    badges.push(
      <Badge
        key="discount"
        variant="destructive"
        className="font-bold shadow-lg animate-pulse"
      >
        <Percent className="w-3 h-3 mr-1" />
        -{discountPercentage}%
      </Badge>
    );
  }

  // Новинка (приоритет 2)
  if (isNew) {
    badges.push(
      <Badge
        key="new"
        variant="secondary"
        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 shadow-lg"
      >
        <Zap className="w-3 h-3 mr-1" />
        Новинка
      </Badge>
    );
  }

  // Хит продаж (приоритет 3)
  if (isFeatured) {
    badges.push(
      <Badge
        key="featured"
        variant="default"
        className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg"
      >
        <Star className="w-3 h-3 mr-1" />
        Хит
      </Badge>
    );
  }

  // Статус наличия (приоритет 4)
  if (isInStock === false) {
    badges.push(
      <Badge
        key="out-of-stock"
        variant="outline"
        className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700 shadow-lg"
      >
        <Clock className="w-3 h-3 mr-1" />
        Под заказ
      </Badge>
    );
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {badges}
    </div>
  );
}

// Компонент для отображения одного бейджика в горизонтальном списке
export function ProductBadgeInline({
  type,
  value,
  className,
}: {
  type: "discount" | "new" | "featured" | "out-of-stock";
  value?: number;
  className?: string;
}) {
  const badgeConfig = {
    discount: {
      variant: "destructive" as const,
      icon: Percent,
      text: value ? `-${value}%` : "Скидка",
      className: "font-bold shadow-sm animate-pulse",
    },
    new: {
      variant: "secondary" as const,
      icon: Zap,
      text: "Новинка",
      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 shadow-sm",
    },
    featured: {
      variant: "default" as const,
      icon: Star,
      text: "Хит",
      className: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
    },
    "out-of-stock": {
      variant: "outline" as const,
      icon: Clock,
      text: "Под заказ",
      className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100 dark:border-orange-700 shadow-sm",
    },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}

// Компонент для компактного отображения статуса товара
export function ProductStatusBadge({
  isInStock,
  trackInventory,
  inventoryQuantity,
  className,
}: {
  isInStock?: boolean;
  trackInventory?: boolean;
  inventoryQuantity?: number;
  className?: string;
}) {
  if (!trackInventory) {
    return (
      <Badge variant="outline" className={cn("text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400", className)}>
        В наличии
      </Badge>
    );
  }

  if (isInStock) {
    const quantity = inventoryQuantity || 0;
    const isLowStock = quantity > 0 && quantity <= 5;

    return (
      <Badge
        variant="outline"
        className={cn(
          isLowStock
            ? "text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400"
            : "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
          className
        )}
      >
        {isLowStock ? `Осталось ${quantity}` : "В наличии"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400", className)}
    >
      <Clock className="w-3 h-3 mr-1" />
      Под заказ
    </Badge>
  );
}
