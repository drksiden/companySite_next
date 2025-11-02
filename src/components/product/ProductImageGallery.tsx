"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { ZoomIn, X } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
}

export function ProductImageGallery({
  images,
  productName,
  className,
  maxWidth = "md",
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainApi, setMainApi] = useState<any>(null);
  const [thumbsApi, setThumbsApi] = useState<any>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Фильтруем валидные изображения
  const validImages = images.filter((img) => img && img.trim() !== "");

  // Синхронизация каруселей
  React.useEffect(() => {
    if (!mainApi || !thumbsApi) return;

    const onSelect = () => {
      const selected = mainApi.selectedScrollSnap();
      setSelectedImage(selected);
      thumbsApi.scrollTo(selected);
    };

    mainApi.on("select", onSelect);
    onSelect();

    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, thumbsApi]);

  // Сброс зума при смене изображения
  React.useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [selectedImage, isFullscreen]);

  // Функции для зума и панорамирования
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.5, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const newScale = prev / 1.5;
      if (newScale <= 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return newScale;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;

    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setLastPanPoint({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastPanPoint.x;
    const deltaY = touch.clientY - lastPanPoint.y;

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    setLastPanPoint({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const zoomFactor = 1.2;

    if (delta > 0 && scale < 4) {
      setScale((prev) => Math.min(prev * zoomFactor, 4));
    } else if (delta < 0) {
      setScale((prev) => {
        const newScale = prev / zoomFactor;
        if (newScale <= 1) {
          setPosition({ x: 0, y: 0 });
          return 1;
        }
        return newScale;
      });
    }
  };

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
            <span className="text-2xl text-muted-foreground">📷</span>
          </div>
          <p className="text-muted-foreground text-sm">Нет изображений</p>
        </div>
      </div>
    );
  }

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  return (
    <div
      // Ограничиваем максимальную ширину
      className={cn(
        "space-y-3 md:space-y-4 w-full mx-auto overflow-hidden",
        maxWidthClasses[maxWidth],
        className
      )} 
    >
      {/* Основная карусель */}
      <div className="relative w-full px-2 sm:px-0 mx-auto"> 
        <Carousel
          opts={{
            align: "center",
            loop: validImages.length > 1,
          }}
          className="w-full"
          setApi={setMainApi}
        >
          <CarouselContent>
            {validImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-square overflow-hidden rounded-lg sm:rounded-xl bg-muted mx-1 sm:mx-0">
                  <Image
                    src={image}
                    alt={`${productName} - изображение ${index + 1}`}
                    fill
                    // Оставлено sm:object-cover для страницы товара, если нужно. 
                    // Для новости можно оставить object-contain.
                    className="object-contain  transition-transform duration-300 hover:scale-105 cursor-zoom-in" 
                    // Sizes обновлены для учета полной ширины на больших экранах
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 100vw"
                    priority={index === 0}
                    onClick={() => {
                      setSelectedImage(index);
                      setIsFullscreen(true);
                    }}
                    unoptimized={image.includes("r2.dev")}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {validImages.length > 1 && (
            <>
              {/* Навигация смещена ближе к краям контейнера */}
              <CarouselPrevious className="left-2 sm:left-4 h-8 w-8 sm:h-10 sm:w-10 translate-x-0" />
              <CarouselNext className="right-2 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 translate-x-0" />
            </>
          )}
        </Carousel>

        {/* Индикатор количества изображений */}
        {validImages.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
            {selectedImage + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {validImages.length > 1 && (
        <Carousel
          opts={{
            align: "start",
            containScroll: "keepSnaps",
            dragFree: true,
          }}
          // Убрано "sm:max-w-md" для максимальной ширины
          className="w-full px-2 mx-auto sm:px-0" 
          setApi={setThumbsApi}
        >
          <CarouselContent className="-ml-1 px-1">
            {validImages.map((image, index) => (
              <CarouselItem key={index} className="basis-auto pl-1">
                <button
                  className={cn(
                    "relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all hover:scale-105 flex-shrink-0 touch-manipulation",
                    index === selectedImage
                      ? "border-primary shadow-lg"
                      : "border-muted hover:border-primary/50",
                  )}
                  onClick={() => {
                    setSelectedImage(index);
                    mainApi?.scrollTo(index);
                  }}
                >
                  <Image
                    src={image}
                    alt={`${productName} миниатюра ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 56px, 80px"
                    unoptimized={image.includes("r2.dev")}
                  />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      {/* Полноэкранное модальное окно (без изменений, так как оно уже full screen) */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent
          className="
            max-w-screen w-screen max-h-screen h-dvh p-0 m-0
            [&>button]:hidden
            border-0
            rounded-none
            overflow-hidden
            bg-black/5 backdrop-blur-xl 
          "
        >
          <VisuallyHidden>
            <DialogTitle>Просмотр изображения {productName}</DialogTitle>
          </VisuallyHidden>

          <div className="relative w-full h-full flex items-center justify-center">
            {/* Основное изображение */}
            <div
              ref={imageRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              onWheel={handleWheel}
              style={{
                touchAction: scale > 1 ? "none" : "auto",
              }}
            >
              <div
                className="transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transformOrigin: "center center",
                }}
              >
                <Image
                  src={validImages[selectedImage]}
                  alt={`${productName} - полный размер ${selectedImage + 1}`}
                  width={1200}
                  height={1200}
                  className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain select-none"
                  sizes="100vw"
                  unoptimized={validImages[selectedImage]?.includes("r2.dev")}
                  draggable={false}
                />
              </div>
            </div>

            {/* Панель управления вверху */}
            <div className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-b from-black/80 to-transparent z-30 flex items-center justify-between px-4 safe-area-inset-top">
              <div className="flex items-center gap-2">
                {/* Кнопки зума */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/5 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                >
                  <span className="text-lg font-bold">-</span>
                </Button>
                <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/5 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                  onClick={handleZoomIn}
                  disabled={scale >= 4}
                >
                  <span className="text-lg font-bold">+</span>
                </Button>
              </div>

              {/* Кнопка закрытия */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-black/5 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* Навигационные кнопки */}
            {validImages.length > 1 && scale === 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/5 hover:bg-white/30 backdrop-blur-sm text-white z-20 border border-white/30"
                  onClick={() => {
                    const prevIndex =
                      selectedImage === 0
                        ? validImages.length - 1
                        : selectedImage - 1;
                    setSelectedImage(prevIndex);
                  }}
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/5 hover:bg-white/30 backdrop-blur-sm text-white z-20 border border-white/30"
                  onClick={() => {
                    const nextIndex =
                      selectedImage === validImages.length - 1
                        ? 0
                        : selectedImage + 1;
                    setSelectedImage(nextIndex);
                  }}
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </>
            )}

            {/* Нижняя панель с индикатором и подсказками */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent z-30 safe-area-inset-bottom">
              <div className="flex flex-col items-center justify-center py-3 sm:py-4 px-4">
                {/* Индикатор количества изображений */}
                {validImages.length > 1 && (
                  <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm border border-white/30 mb-2">
                    {selectedImage + 1} / {validImages.length}
                  </div>
                )}
              </div>
            </div>

            {/* Миниатюры в полноэкранном режиме - только для десктопа */}
            {validImages.length > 1 && scale === 1 && (
              <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 hidden sm:flex gap-2 z-20 bg-black/40 backdrop-blur-sm rounded-full p-3 border border-white/20 max-w-[85vw] overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative w-12 h-12 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 flex-shrink-0",
                      index === selectedImage
                        ? "border-white shadow-lg shadow-white/25"
                        : "border-white/30 hover:border-white/60 opacity-70 hover:opacity-100",
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
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}