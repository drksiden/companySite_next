"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/enhanced-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";

interface ProductImage {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
  is_primary?: boolean;
}

interface ProductImageDisplayProps {
  images?: ProductImage[];
  thumbnail?: string;
  productName: string;
  size?: "sm" | "md" | "lg";
  showZoom?: boolean;
  showGallery?: boolean;
  className?: string;
}

interface ImageGalleryProps {
  images: ProductImage[];
  initialIndex?: number;
  productName: string;
}

// Компонент галереи изображений
function ImageGallery({ images, initialIndex = 0, productName }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="space-y-4">
      {/* Основное изображение */}
      <div className="relative aspect-square max-w-lg mx-auto bg-muted rounded-lg overflow-hidden">
        <Image
          src={currentImage.url}
          alt={currentImage.alt || productName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 512px"
          quality={85}
          priority={currentIndex === 0}
          loading={currentIndex === 0 ? undefined : "lazy"}
          unoptimized={
          currentImage.url === "/images/placeholder-product.svg" ||
          currentImage.url.includes("r2.asia-ntb.kz") ||
          currentImage.url.includes("r2.dev")
        }
        />

        {/* Навигация */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Индикатор позиции */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {currentIndex + 1} из {images.length}
            </Badge>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="absolute top-2 right-2 flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={() => window.open(currentImage.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={() => {
              const link = document.createElement('a');
              link.href = currentImage.url;
              link.download = `${productName}-${currentIndex + 1}.jpg`;
              link.click();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Миниатюры */}
      {images.length > 1 && (
        <div className="flex gap-2 justify-center overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200 flex-shrink-0",
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
              {image.is_primary && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-bl">
                  Главное
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Информация об изображении */}
      {currentImage.caption && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{currentImage.caption}</p>
        </div>
      )}
    </div>
  );
}

// Основной компонент отображения изображения продукта
export function ProductImageDisplay({
  images = [],
  thumbnail,
  productName,
  size = "md",
  showZoom = true,
  showGallery = true,
  className,
}: ProductImageDisplayProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Определяем изображение для отображения
  const displayImage = thumbnail || images[0]?.url;
  const hasMultipleImages = images.length > 1;

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  if (!displayImage) {
    return (
      <div
        className={cn(
          "bg-muted/80 rounded-lg flex items-center justify-center border transition-colors duration-200 hover:bg-muted",
          sizeClasses[size],
          className
        )}
      >
        <Package className={cn("text-muted-foreground", iconSizes[size])} />
      </div>
    );
  }

  const ImageComponent = (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-md group",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={displayImage}
        alt={productName}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes={size === "sm" ? "40px" : size === "md" ? "48px" : "64px"}
        quality={75}
        loading="lazy"
        unoptimized={
          displayImage === "/images/placeholder-product.svg" ||
          displayImage.includes("r2.asia-ntb.kz") ||
          displayImage.includes("r2.dev")
        }
      />

      {/* Overlay при наведении */}
      {showZoom && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <ZoomIn className={cn(
            "text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            iconSizes[size]
          )} />
        </div>
      )}

      {/* Индикатор множественных изображений */}
      {hasMultipleImages && showGallery && (
        <div className="absolute top-1 right-1">
          <Badge
            variant="secondary"
            className="text-xs h-4 px-1 bg-background/80 backdrop-blur-sm"
          >
            +{images.length - 1}
          </Badge>
        </div>
      )}

      {/* Индикатор главного изображения */}
      {images.find(img => img.is_primary)?.url === displayImage && (
        <div className="absolute top-1 left-1">
          <Badge
            variant="default"
            className="text-xs h-4 px-1 bg-primary/80 backdrop-blur-sm"
          >
            Главное
          </Badge>
        </div>
      )}
    </div>
  );

  if (!showZoom && !showGallery) {
    return ImageComponent;
  }

  return (
    <>
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogTrigger asChild>
          <button className="transition-transform duration-200 hover:scale-105">
            {ImageComponent}
          </button>
        </DialogTrigger>
        <DialogContent size="lg" className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Изображения товара: {productName}</DialogTitle>
          </DialogHeader>
          <ImageGallery
            images={images.length > 0 ? images : [{ url: displayImage, alt: productName }]}
            productName={productName}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Компонент для отображения списка изображений в виде сетки
export function ProductImageGrid({
  images,
  productName,
  onImageSelect,
  selectedImage,
  className,
}: {
  images: ProductImage[];
  productName: string;
  onImageSelect?: (image: ProductImage, index: number) => void;
  selectedImage?: ProductImage;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageSelect?.(image, index)}
          className={cn(
            "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105",
            selectedImage?.url === image.url
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          )}
        >
          <Image
            src={image.url}
            alt={image.alt || `${productName} ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 25vw, 100px"
            quality={70}
            loading="lazy"
            unoptimized={
              image.url === "/images/placeholder-product.svg" ||
              image.url.includes("r2.asia-ntb.kz") ||
              image.url.includes("r2.dev")
            }
          />
          {image.is_primary && (
            <div className="absolute top-1 right-1">
              <Badge variant="default" className="text-xs h-4 px-1">
                Главное
              </Badge>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export default ProductImageDisplay;
