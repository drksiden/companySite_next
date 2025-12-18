"use client";

import { useState, useCallback, forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon, AlertCircle } from "lucide-react";

interface OptimizedImageProps {
  src?: string | null;
  alt: string;
  fallbackImages?: string[];
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
  unoptimized?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  showPlaceholder?: boolean;
  placeholderText?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

const OptimizedImage = forwardRef<HTMLDivElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      fallbackImages = [],
      width,
      height,
      fill = false,
      className,
      containerClassName,
      priority = false,
      quality = 85,
      placeholder = "empty",
      blurDataURL,
      sizes,
      loading = "lazy",
      unoptimized,
      onError,
      onLoad,
      showPlaceholder = true,
      placeholderText = "Нет изображения",
      objectFit = "cover",
    },
    ref
  ) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Создаем массив всех доступных изображений
    const allImages = [
      src,
      ...fallbackImages,
    ].filter((img): img is string =>
      img !== null &&
      img !== undefined &&
      typeof img === "string" &&
      img.trim() !== ""
    );

    // Валидация URL изображения
    const isValidImageUrl = useCallback((url: string): boolean => {
      if (!url || typeof url !== "string" || url.trim() === "") return false;

      try {
        // Проверяем что это валидный URL
        new URL(url);
        return true;
      } catch {
        // Если не абсолютный URL, проверяем что это относительный путь
        return (
          url.startsWith("/") ||
          url.startsWith("./") ||
          url.startsWith("../")
        );
      }
    }, []);

    // Обработка ошибки загрузки изображения
    const handleImageError = useCallback(() => {
      const failedImage = allImages[currentImageIndex];
      
      // Логируем ошибку загрузки изображения
      import('@/lib/logger/client').then(({ clientLogger }) => {
        clientLogger.warn('Failed to load image, trying fallback', {
          imageSrc: failedImage,
          alt,
          currentIndex: currentImageIndex,
          totalImages: allImages.length,
          hasFallback: currentImageIndex < allImages.length - 1,
          errorType: 'image-load-error',
          component: 'OptimizedImage',
          error: `Image load failed: ${failedImage}`,
        });
      });

      // Пробуем следующее изображение из списка
      if (currentImageIndex < allImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
        setIsLoading(true);
        return;
      }

      // Если все изображения не загрузились
      setHasError(true);
      setIsLoading(false);
      
      // Логируем критическую ошибку - все изображения не загрузились
      import('@/lib/logger/client').then(({ clientLogger }) => {
        clientLogger.error('All image fallbacks failed', new Error('All images failed to load'), {
          imageSrc: src,
          alt,
          fallbackImages,
          allAttemptedImages: allImages,
          errorType: 'image-all-failed',
          component: 'OptimizedImage',
        });
      });
      
      onError?.();
    }, [currentImageIndex, allImages, onError, src, alt, fallbackImages]);

    // Обработка успешной загрузки
    const handleImageLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
      onLoad?.();
    }, [onLoad]);

    // Получаем текущее изображение для отображения
    const currentImage = allImages[currentImageIndex];
    const shouldShowImage = currentImage &&
                           isValidImageUrl(currentImage) &&
                           !hasError;

    // Определяем нужно ли использовать unoptimized
    // R2 изображения не могут быть оптимизированы Next.js из-за таймаутов
    // Они уже оптимизированы на стороне Cloudflare R2
    const shouldUseUnoptimized = unoptimized ||
                                (currentImage === "/images/placeholder-product.svg") ||
                                (currentImage?.includes("r2.asia-ntb.kz")) ||
                                (currentImage?.includes("r2.dev"));

    // Компонент плейсхолдера
    const ImagePlaceholder = () => (
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center bg-muted",
          "text-muted-foreground transition-colors",
          className
        )}
      >
        <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-xs text-center px-2">
          {placeholderText}
        </span>
      </div>
    );

    // Компонент ошибки
    const ImageError = () => (
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center bg-red-50",
          "text-red-500 transition-colors",
          className
        )}
      >
        <AlertCircle className="h-8 w-8 mb-2 opacity-50" />
        <span className="text-xs text-center px-2">
          Ошибка загрузки
        </span>
      </div>
    );

    // Компонент загрузки
    const ImageLoading = () => (
      <div
        className={cn(
          "w-full h-full flex items-center justify-center bg-muted",
          "animate-pulse",
          className
        )}
      >
        <div className="w-full h-full bg-muted-foreground/10 rounded" />
      </div>
    );

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          !fill && width && height && `w-[${width}px] h-[${height}px]`,
          fill && "w-full h-full",
          containerClassName
        )}
      >
        {shouldShowImage ? (
          <>
            {isLoading && <ImageLoading />}
            <Image
              src={currentImage}
              alt={alt}
              width={width}
              height={height}
              fill={fill}
              priority={priority}
              quality={quality}
              placeholder={placeholder}
              blurDataURL={blurDataURL}
              sizes={sizes}
              loading={loading}
              unoptimized={shouldUseUnoptimized}
              className={cn(
                `object-${objectFit}`,
                "transition-all duration-300",
                isLoading && "opacity-0",
                !isLoading && "opacity-100",
                className
              )}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </>
        ) : hasError ? (
          showPlaceholder && <ImageError />
        ) : (
          showPlaceholder && <ImagePlaceholder />
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export { OptimizedImage };
export type { OptimizedImageProps };
