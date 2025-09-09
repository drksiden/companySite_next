"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  X,
  Package,
  Maximize2,
  RotateCw,
  Download,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OptimizedImage } from "./OptimizedImage";
import { getFirstValidImage, isValidImageUrl } from "@/lib/imageUtils";

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
  priority?: boolean;
  showThumbnails?: boolean;
  showFullscreenButton?: boolean;
  showZoomButton?: boolean;
  maxHeight?: string;
  variant?: "default" | "compact" | "minimal";
}

interface FullscreenGalleryProps {
  images: string[];
  productName: string;
  initialIndex: number;
  onClose: () => void;
}

export function ImageGallery({
  images,
  productName,
  className,
  priority = false,
  showThumbnails = true,
  showFullscreenButton = true,
  showZoomButton = true,
  maxHeight = "600px",
  variant = "default",
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Фильтруем валидные изображения
  const validImages = useMemo(
    () => images.filter((img) => img && img.trim() !== ""),
    [images],
  );

  // Используем простую проверку изображений
  const loading = false;

  // Main carousel
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    skipSnaps: false,
    dragFree: false,
  });

  // Thumbnail carousel
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    axis: "x",
    align: "start",
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    const newIndex = emblaMainApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    emblaThumbsApi.scrollTo(newIndex);
  }, [emblaMainApi, emblaThumbsApi]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);

    return () => {
      emblaMainApi.off("select", onSelect);
      emblaMainApi.off("reInit", onSelect);
    };
  }, [emblaMainApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  const canScrollPrev = emblaMainApi?.canScrollPrev() ?? false;
  const canScrollNext = emblaMainApi?.canScrollNext() ?? false;

  // Если нет изображений
  if (validImages.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div
          className="relative aspect-square bg-muted rounded-lg flex items-center justify-center"
          style={{ maxHeight }}
        >
          <div className="text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Нет изображения</p>
          </div>
        </div>
      </div>
    );
  }

  const isCompact = variant === "compact";
  const isMinimal = variant === "minimal";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image Carousel */}
      <div className="relative group">
        <div
          className={cn(
            "overflow-hidden bg-muted",
            isMinimal ? "rounded" : "rounded-lg",
          )}
          ref={emblaMainRef}
          style={!isMinimal ? { maxHeight } : undefined}
        >
          <div className="flex">
            {validImages.map((image, index) => (
              <div
                key={index}
                className={cn(
                  "relative flex-[0_0_100%]",
                  isCompact ? "aspect-[4/3]" : "aspect-square",
                )}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="transition-transform duration-300 hover:scale-105"
                  priority={priority && index === 0}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  placeholderText="Нет изображения"
                  objectFit="cover"
                  loading={priority && index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && !isMinimal && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              <Button
                variant="secondary"
                size="sm"
                disabled={!canScrollPrev}
                className={cn(
                  "absolute left-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0",
                  "bg-background/80 hover:bg-background/90 backdrop-blur-sm z-10 pointer-events-auto",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "shadow-lg border",
                  !canScrollPrev && "opacity-50 cursor-not-allowed",
                )}
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={!canScrollNext}
                className={cn(
                  "absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0",
                  "bg-background/80 hover:bg-background/90 backdrop-blur-sm z-10 pointer-events-auto",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "shadow-lg border",
                  !canScrollNext && "opacity-50 cursor-not-allowed",
                )}
                onClick={scrollNext}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Control Buttons */}
        {!isMinimal && (
          <div className="absolute top-2 right-2 flex gap-1 z-20">
            {showZoomButton && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border"
                onClick={() => setIsFullscreen(true)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            )}

            {showFullscreenButton && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-background/80 hover:bg-background/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && !isMinimal && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border">
            <span className="text-xs text-foreground font-medium">
              {selectedIndex + 1} / {validImages.length}
            </span>
          </div>
        )}

        {/* Loading/Error Indicator */}
        {loading && !isMinimal && (
          <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 z-20 shadow-lg border">
            <div className="flex items-center gap-1">
              {loading && (
                <>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs text-foreground">Загрузка</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && validImages.length > 1 && !isMinimal && (
        <div className="relative">
          <div className="overflow-hidden" ref={emblaThumbsRef}>
            <div className="flex gap-2 py-1">
              {validImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onThumbClick(index)}
                  className={cn(
                    "relative bg-muted rounded-md overflow-hidden flex-shrink-0 border-2 transition-all duration-200",
                    isCompact ? "w-12 h-12" : "w-16 h-16",
                    index === selectedIndex
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent hover:border-muted-foreground/50 hover:scale-102",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  )}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${productName} миниатюра ${index + 1}`}
                    fill
                    quality={60}
                    sizes={isCompact ? "48px" : "64px"}
                    placeholderText=""
                    objectFit="cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Dialog */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] w-full max-h-[100vh] h-full p-0 bg-black/98 border-none">
          <FullscreenGallery
            images={validImages}
            productName={productName}
            initialIndex={selectedIndex}
            onClose={() => setIsFullscreen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Fullscreen Gallery Component
function FullscreenGallery({
  images,
  productName,
  initialIndex,
  onClose,
}: FullscreenGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: initialIndex,
    align: "center",
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setCurrentIndex(newIndex);
    // Сброс трансформаций при переключении
    setIsZoomed(false);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
    setIsZoomed(true);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newLevel = Math.max(prev - 0.5, 1);
      if (newLevel === 1) {
        setIsZoomed(false);
        setPanOffset({ x: 0, y: 0 });
      }
      return newLevel;
    });
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setIsZoomed(false);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const currentImage = images[currentIndex];
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${productName}-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  }, [images, currentIndex, productName]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: productName,
          text: `Посмотрите на это изображение товара: ${productName}`,
          url: window.location.href,
        });
      } else {
        // Fallback: копируем в буфер обмена
        await navigator.clipboard.writeText(window.location.href);
        // Здесь можно добавить toast уведомление
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  }, [productName]);

  // Обработка мыши для панорамирования при увеличении
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isZoomed) return;
      setIsDragging(true);
      e.preventDefault();
    },
    [isZoomed],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !isZoomed) return;

      setPanOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    },
    [isDragging, isZoomed],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          scrollPrev();
          break;
        case "ArrowRight":
          scrollNext();
          break;
        case " ":
          isZoomed ? handleZoomOut() : handleZoomIn();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "r":
        case "R":
          handleRotate();
          break;
        case "0":
          handleReset();
          break;
        case "d":
        case "D":
          handleDownload();
          break;
        case "s":
        case "S":
          handleShare();
          break;
      }
    },
    [
      onClose,
      scrollPrev,
      scrollNext,
      isZoomed,
      handleZoomIn,
      handleZoomOut,
      handleRotate,
      handleReset,
      handleDownload,
      handleShare,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  const canScrollPrevFS = emblaApi?.canScrollPrev() ?? false;
  const canScrollNextFS = emblaApi?.canScrollNext() ?? false;

  return (
    <div
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
        <div className="bg-background/20 backdrop-blur-sm rounded-md px-3 py-1 border border-white/20">
          <span className="text-sm text-white font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            title="Уменьшить (- или колесо мыши)"
          >
            <ZoomOut className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 5}
            title="Увеличить (+ или пробел)"
          >
            <ZoomIn className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={handleRotate}
            title="Повернуть (R)"
          >
            <RotateCw className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={handleDownload}
            title="Скачать (D)"
          >
            <Download className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={handleShare}
            title="Поделиться (S)"
          >
            <Share2 className="h-4 w-4 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0 bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20"
            onClick={onClose}
            title="Закрыть (Esc)"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>

      {/* Main Carousel */}
      <div className="w-full h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] h-full flex items-center justify-center p-8"
            >
              <motion.div
                className="relative max-w-full max-h-full select-none"
                animate={{
                  scale: zoomLevel,
                  x: panOffset.x,
                  y: panOffset.y,
                  rotate: rotation,
                }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                style={{
                  cursor: isZoomed
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "zoom-in",
                  transformOrigin: "center center",
                }}
                onClick={!isZoomed ? handleZoomIn : undefined}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productName} ${index + 1}`}
                  width={1200}
                  height={1200}
                  className="object-contain max-w-[90vw] max-h-[90vh] pointer-events-none"
                  priority={index === initialIndex}
                  quality={100}
                  sizes="90vw"
                  placeholderText="Загрузка..."
                  objectFit="contain"
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            disabled={!canScrollPrevFS}
            className={cn(
              "absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0",
              "bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20",
              "transition-opacity duration-200",
              !canScrollPrevFS && "opacity-30 cursor-not-allowed",
            )}
            onClick={scrollPrev}
            title="Предыдущее изображение (←)"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={!canScrollNextFS}
            className={cn(
              "absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0",
              "bg-background/20 hover:bg-background/30 backdrop-blur-sm border-white/20",
              "transition-opacity duration-200",
              !canScrollNextFS && "opacity-30 cursor-not-allowed",
            )}
            onClick={scrollNext}
            title="Следующее изображение (→)"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        </>
      )}

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex gap-2 max-w-md overflow-hidden bg-background/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "relative w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0 border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-white ring-2 ring-white/30 scale-110"
                    : "border-transparent hover:border-white/50 hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-white/50",
                )}
                title={`Изображение ${index + 1}`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productName} миниатюра ${index + 1}`}
                  fill
                  quality={50}
                  sizes="48px"
                  placeholderText=""
                  objectFit="cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zoom Level Indicator */}
      {isZoomed && (
        <div className="absolute bottom-4 right-4 bg-background/20 backdrop-blur-sm rounded-md px-3 py-1 z-40 border border-white/20">
          <span className="text-sm text-white font-medium">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      )}

      {/* Help Text */}
      <div className="absolute bottom-4 left-4 bg-background/20 backdrop-blur-sm rounded-md px-3 py-1 z-40 border border-white/20">
        <div className="text-xs text-white/80 space-y-0.5">
          <div>ESC - закрыть</div>
          <div>← → - навигация</div>
          <div>Пробел - зум</div>
          <div>R - поворот</div>
          {isZoomed && <div>Мышь - перемещение</div>}
        </div>
      </div>
    </div>
  );
}
