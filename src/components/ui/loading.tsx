"use client";

import { motion } from "framer-motion";
import { Loader2, Package, ShoppingCart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "pulse" | "dots" | "bars" | "skeleton";
  text?: string;
  overlay?: boolean;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  text,
  overlay = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const LoadingContent = () => {
    switch (variant) {
      case "spinner":
        return (
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
        );

      case "pulse":
        return (
          <motion.div
            className={cn(
              "bg-primary rounded-full",
              sizeClasses[size]
            )}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );

      case "dots":
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className={cn(
                  "bg-primary rounded-full",
                  size === "sm" ? "w-1 h-1" : size === "md" ? "w-2 h-2" : "w-3 h-3"
                )}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex gap-1 items-end">
            {[0, 1, 2, 3].map((index) => (
              <motion.div
                key={index}
                className={cn(
                  "bg-primary",
                  size === "sm"
                    ? "w-1"
                    : size === "md"
                    ? "w-1.5"
                    : "w-2"
                )}
                animate={{
                  height: [
                    size === "sm" ? "4px" : size === "md" ? "8px" : "12px",
                    size === "sm" ? "12px" : size === "md" ? "20px" : "28px",
                    size === "sm" ? "4px" : size === "md" ? "8px" : "12px",
                  ],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );

      case "skeleton":
        return (
          <div className="animate-pulse space-y-2">
            <div className={cn(
              "bg-muted rounded",
              size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6",
              "w-full"
            )} />
            <div className={cn(
              "bg-muted rounded",
              size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6",
              "w-3/4"
            )} />
            <div className={cn(
              "bg-muted rounded",
              size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-6",
              "w-1/2"
            )} />
          </div>
        );

      default:
        return (
          <Loader2
            className={cn("animate-spin text-primary", sizeClasses[size])}
          />
        );
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        overlay && "absolute inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
    >
      <LoadingContent />
      {text && (
        <p className={cn(
          "text-muted-foreground font-medium",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full h-full min-h-32"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}

// Специализированные компоненты загрузки
export function ProductsLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Package className="w-8 h-8 text-primary" />
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <p className="text-muted-foreground mt-3 font-medium">
        Загружаем товары...
      </p>
    </div>
  );
}

export function CartLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShoppingCart className="w-8 h-8 text-primary" />
      </motion.div>
      <p className="text-muted-foreground mt-3 font-medium">
        Обновляем корзину...
      </p>
    </div>
  );
}

export function FastLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <motion.div
        animate={{
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Zap className="w-4 h-4 text-primary" />
      </motion.div>
      <span className="text-sm text-muted-foreground">Загрузка...</span>
    </div>
  );
}

// Скелетон для карточек товаров
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-3 p-4 border rounded-lg", className)}>
      <div className="aspect-square bg-muted rounded-md" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-5 bg-muted rounded w-1/3" />
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-muted rounded flex-1" />
        <div className="h-8 w-8 bg-muted rounded" />
      </div>
    </div>
  );
}

// Скелетон для таблицы
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse space-y-3", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-muted rounded flex-1"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-8 bg-muted rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Индикатор страницы
export function PageLoader({ text = "Загружаем страницу..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-lg font-medium text-foreground">{text}</p>
      </div>
    </div>
  );
}
