"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons/SimpleIcons";

interface BasicImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

export function BasicImageGallery({
  images,
  productName,
  className,
}: BasicImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Фильтруем валидные изображения
  const validImages = images.filter((img) => img && img.trim() !== "");

  if (validImages.length === 0) {
    return (
      <div
        className={cn(
          "w-full aspect-square bg-muted rounded-lg flex items-center justify-center",
          className,
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <span className="text-muted-foreground">📷</span>
          </div>
          <p className="text-muted-foreground text-sm">Нет изображений</p>
        </div>
      </div>
    );
  }

  const currentImage = validImages[selectedImage] || validImages[0];

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Основное изображение */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={currentImage}
            alt={`${productName} - изображение ${selectedImage + 1}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105 cursor-zoom-in"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
            priority={selectedImage === 0}
            onClick={() => setIsFullscreen(true)}
            unoptimized={currentImage.includes("r2.dev")}
            onError={() => console.error(`Failed to load image: ${currentImage}`)}
          />

          {/* Кнопка увеличения */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
            onClick={() => setIsFullscreen(true)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Навигационные стрелки для основного изображения */}
          {validImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
                onClick={() =>
                  setSelectedImage(
                    selectedImage === 0
                      ? validImages.length - 1
                      : selectedImage - 1,
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 opacity-80 hover:opacity-100"
                onClick={() =>
                  setSelectedImage(
                    selectedImage === validImages.length - 1
                      ? 0
                      : selectedImage + 1,
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Индикатор изображения */}
          {validImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {selectedImage + 1} / {validImages.length}
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all",
                  index === selectedImage
                    ? "border-primary"
                    : "border-muted hover:border-primary/50",
                )}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} миниатюра ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={image.includes("r2.dev")}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Полноэкранный просмотр БЕЗ Dialog */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={currentImage}
              alt={`${productName} - полный размер`}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized={currentImage.includes("r2.dev")}
            />

            {/* Кнопка закрытия */}
            <button
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-10 transition-all duration-200"
              onClick={() => setIsFullscreen(false)}
              aria-label="Закрыть галерею"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Навигация в полноэкранном режиме */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() =>
                    setSelectedImage(
                      selectedImage === 0
                        ? validImages.length - 1
                        : selectedImage - 1,
                    )
                  }
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 z-10 bg-white/10 hover:bg-white/20 text-white border-white/20"
                  onClick={() =>
                    setSelectedImage(
                      selectedImage === validImages.length - 1
                        ? 0
                        : selectedImage + 1,
                    )
                  }
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Индикатор в полноэкранном режиме */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm z-10">
                  {selectedImage + 1} / {validImages.length}
                </div>

                {/* Миниатюры в полноэкранном режиме */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-1 max-w-xs overflow-x-auto z-10">
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative flex-shrink-0 w-12 h-12 rounded border-2 overflow-hidden transition-all",
                        index === selectedImage
                          ? "border-white"
                          : "border-white/30 hover:border-white/60",
                      )}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${productName} миниатюра ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={image.includes("r2.dev")}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Клик вне изображения для закрытия */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setIsFullscreen(false)}
          />
        </div>
      )}
    </>
  );
}
