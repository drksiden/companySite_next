"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Archive,
  AlertTriangle,
  Eye,
  EyeOff,
  Star,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  ShoppingCart,
} from "lucide-react";

interface ProductStatusIndicatorProps {
  status: "draft" | "active" | "archived" | "out_of_stock" | "made_to_order";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

interface StockStatusIndicatorProps {
  quantity: number;
  minStockLevel?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

interface FeaturedIndicatorProps {
  isFeatured: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface VisibilityIndicatorProps {
  isVisible: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Основной индикатор статуса продукта
export function ProductStatusIndicator({
  status,
  size = "md",
  showIcon = true,
  className,
}: ProductStatusIndicatorProps) {
  const statusConfig = {
    draft: {
      label: "Черновик",
      icon: Clock,
      variant: "secondary" as const,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    },
    active: {
      label: "Активный",
      icon: CheckCircle,
      variant: "default" as const,
      className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
    },
    archived: {
      label: "Архивирован",
      icon: Archive,
      variant: "outline" as const,
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800",
    },
    out_of_stock: {
      label: "Нет в наличии",
      icon: AlertTriangle,
      variant: "destructive" as const,
      className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    },
    made_to_order: {
      label: "На заказ",
      icon: ShoppingCart,
      variant: "default" as const,
      className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    },
  };

  const config = statusConfig[status];
  
  // Защита от undefined (на случай если статус не найден)
  if (!config) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }
  
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-2.5",
    lg: "text-base h-7 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}

// Индикатор состояния склада
export function StockStatusIndicator({
  quantity,
  minStockLevel = 5,
  size = "md",
  showIcon = true,
  className,
}: StockStatusIndicatorProps) {
  const getStockStatus = () => {
    if (quantity === 0) {
      return {
        label: "Нет в наличии",
        icon: Minus,
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
      };
    } else if (quantity <= minStockLevel) {
      return {
        label: "Мало на складе",
        icon: TrendingDown,
        className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
      };
    } else {
      return {
        label: "В наличии",
        icon: TrendingUp,
        className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
      };
    }
  };

  const stockStatus = getStockStatus();
  const Icon = stockStatus.icon;

  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-2.5",
    lg: "text-base h-7 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        stockStatus.className,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {stockStatus.label}
    </Badge>
  );
}

// Индикатор рекомендуемого товара
export function FeaturedIndicator({
  isFeatured,
  size = "md",
  className,
}: FeaturedIndicatorProps) {
  if (!isFeatured) return null;

  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-2.5",
    lg: "text-base h-7 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="secondary"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
        sizeClasses[size],
        className
      )}
    >
      <Star className={cn(iconSizes[size], "fill-current")} />
      Рекомендуемый
    </Badge>
  );
}

// Индикатор видимости
export function VisibilityIndicator({
  isVisible,
  size = "md",
  className,
}: VisibilityIndicatorProps) {
  const Icon = isVisible ? Eye : EyeOff;

  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-2.5",
    lg: "text-base h-7 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        isVisible
          ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/20 dark:text-gray-500 dark:border-gray-800",
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      {isVisible ? "Видимый" : "Скрытый"}
    </Badge>
  );
}

// Индикатор типа продукта
export function ProductTypeIndicator({
  isDigital,
  size = "md",
  className,
}: {
  isDigital: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-xs h-5 px-2",
    md: "text-sm h-6 px-2.5",
    lg: "text-base h-7 px-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 font-medium transition-all duration-200",
        isDigital
          ? "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800"
          : "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
        sizeClasses[size],
        className
      )}
    >
      <Package className={iconSizes[size]} />
      {isDigital ? "Цифровой" : "Физический"}
    </Badge>
  );
}

// Комбинированный компонент для отображения всех статусов
export function ProductStatusGroup({
  status,
  quantity,
  minStockLevel,
  isFeatured,
  isDigital,
  className,
}: {
  status: "draft" | "active" | "archived" | "out_of_stock" | "made_to_order";
  quantity: number;
  minStockLevel?: number;
  isFeatured?: boolean;
  isDigital?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <ProductStatusIndicator status={status} size="sm" />
      <StockStatusIndicator
        quantity={quantity}
        minStockLevel={minStockLevel}
        size="sm"
      />
      {isFeatured && <FeaturedIndicator isFeatured={true} size="sm" />}
      {isDigital !== undefined && (
        <ProductTypeIndicator isDigital={isDigital} size="sm" />
      )}
    </div>
  );
}

export default ProductStatusIndicator;
