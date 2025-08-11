"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
  lazy?: boolean;
  showLoading?: boolean;
  loadingVariant?: "spinner" | "skeleton" | "blur";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = "blur",
  blurDataURL,
  sizes,
  objectFit = "cover",
  objectPosition = "center",
  onLoad,
  onError,
  fallback,
  lazy = true,
  showLoading = true,
  loadingVariant = "blur",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Начинаем загрузку за 50px до появления
        threshold: 0.1,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Генерируем blur placeholder если не предоставлен
  const defaultBlurDataURL = blurDataURL || generateBlurDataURL();

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Fallback контент
  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Изображение недоступно
          </p>
        </div>
      </div>
    );
  };

  // Loading состояние
  const renderLoading = () => {
    if (!showLoading) return null;

    switch (loadingVariant) {
      case "spinner":
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <motion.div
              className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        );

      case "skeleton":
        return (
          <div className="absolute inset-0 bg-muted animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          </div>
        );

      case "blur":
      default:
        return (
          <div className="absolute inset-0 bg-muted">
            <div className="w-full h-full bg-gradient-to-br from-muted/80 to-muted/40 animate-pulse" />
          </div>
        );
    }
  };

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        className,
      )}
      style={{
        width: !fill ? width : undefined,
        height: !fill ? height : undefined,
      }}
    >
      <AnimatePresence mode="wait">
        {!isInView ? (
          // Placeholder до загрузки
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center bg-muted"
          >
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        ) : hasError ? (
          // Ошибка загрузки
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {renderFallback()}
          </motion.div>
        ) : (
          // Изображение
          <motion.div
            key="image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            <Image
              src={src}
              alt={alt}
              width={fill ? undefined : width}
              height={fill ? undefined : height}
              fill={fill}
              priority={priority}
              quality={quality}
              placeholder={placeholder}
              blurDataURL={defaultBlurDataURL}
              sizes={sizes}
              className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
              )}
              style={{
                objectFit: fill ? objectFit : undefined,
                objectPosition: fill ? objectPosition : undefined,
              }}
              onLoad={handleLoad}
              onError={handleError}
            />

            {/* Loading overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {renderLoading()}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Компонент для аватаров
export function Avatar({
  src,
  alt,
  size = "md",
  className,
  fallback,
}: {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallback?: string;
}) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const fallbackContent = fallback || alt.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-muted flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          className="rounded-full"
          objectFit="cover"
          priority
          fallback={
            <div
              className={cn(
                "w-full h-full flex items-center justify-center bg-primary/10 text-primary font-medium",
                textSizes[size],
              )}
            >
              {fallbackContent}
            </div>
          }
        />
      ) : (
        <span className={cn("font-medium text-primary", textSizes[size])}>
          {fallbackContent}
        </span>
      )}
    </div>
  );
}

// Компонент для превью продукта
export function ProductImage({
  src,
  alt,
  className,
  aspectRatio = "square",
  showBadge,
  badgeText,
  badgeVariant = "default",
}: {
  src?: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "4/3" | "16/9" | "3/4";
  showBadge?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "destructive" | "secondary";
}) {
  const aspectClasses = {
    square: "aspect-square",
    "4/3": "aspect-[4/3]",
    "16/9": "aspect-video",
    "3/4": "aspect-[3/4]",
  };

  const badgeClasses = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted",
        aspectClasses[aspectRatio],
        className,
      )}
    >
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="transition-transform duration-300 hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )}

      {showBadge && badgeText && (
        <div
          className={cn(
            "absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium",
            badgeClasses[badgeVariant],
          )}
        >
          {badgeText}
        </div>
      )}
    </div>
  );
}

// Утилита для генерации blur placeholder
function generateBlurDataURL(): string {
  // Простой серый blur placeholder
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#f3f4f6"/>
    </svg>`,
  )}`;
}

// Removed duplicate useImagePreloader - using the one from hooks/useImagePreloader.ts
