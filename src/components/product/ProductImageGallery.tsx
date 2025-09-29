"use client";

import React, { useState } from "react";
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
}

export function ProductImageGallery({
  images,
  productName,
  className,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mainApi, setMainApi] = useState<any>(null);
  const [thumbsApi, setThumbsApi] = useState<any>(null);

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

  return (
    <div
      className={cn("space-y-3 md:space-y-4 w-full overflow-hidden", className)}
    >
      {/* Основная карусель */}
      <div className="relative w-full max-w-full px-2 sm:px-0 sm:max-w-md mx-auto">
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
                    className="object-contain sm:object-cover transition-transform duration-300 hover:scale-105 cursor-zoom-in"
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 600px"
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
              <CarouselPrevious className="left-2 sm:left-2 h-8 w-8 sm:h-10 sm:w-10 -translate-x-0 sm:-translate-x-12" />
              <CarouselNext className="right-2 sm:right-2 h-8 w-8 sm:h-10 sm:w-10 -translate-x-0 sm:translate-x-12" />
            </>
          )}
        </Carousel>

        {/* Кнопка увеличения */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 h-8 w-8 sm:h-10 sm:w-10 p-0 opacity-80 hover:opacity-100 backdrop-blur-sm"
          onClick={() => setIsFullscreen(true)}
        >
          <ZoomIn className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

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
          className="w-full max-w-full px-2 sm:max-w-md mx-auto sm:px-0"
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

      {/* Полноэкранное модальное окно */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-screen w-screen max-h-screen h-screen p-0 m-0 [&>button]:hidden bg-black border-0 rounded-none overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Просмотр изображения {productName}</DialogTitle>
          </VisuallyHidden>

          <div className="relative w-full h-full flex items-center justify-center bg-black touch-pan-y">
            {/* Основное изображение */}
            <div className="relative max-w-[85vw] sm:max-w-[85vw] max-h-[75vh] sm:max-h-[85vh] w-full h-full flex items-center justify-center px-1 sm:px-0">
              <Image
                src={validImages[selectedImage]}
                alt={`${productName} - полный размер ${selectedImage + 1}`}
                width={1200}
                height={1200}
                className="max-w-full max-h-full object-contain transition-opacity duration-300"
                sizes="(max-width: 640px) 95vw, 90vw"
                unoptimized={validImages[selectedImage]?.includes("r2.dev")}
              />
            </div>

            {/* Кнопка закрытия */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 sm:top-4 sm:right-4 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white z-20 border border-white/20 touch-manipulation"
              onClick={() => setIsFullscreen(false)}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>

            {/* Навигационные кнопки */}
            {validImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white z-20 border border-white/20 touch-manipulation"
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
                  className="absolute right-4 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white z-20 border border-white/20 touch-manipulation"
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

            {/* Индикатор в полноэкранном режиме */}
            {validImages.length > 1 && (
              <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm z-10 border border-white/20">
                {selectedImage + 1} / {validImages.length}
              </div>
            )}

            {/* Миниатюры в полноэкранном режиме - скрыть на мобильных */}
            {validImages.length > 1 && (
              <div className="absolute bottom-18 sm:bottom-20 left-1/2 transform -translate-x-1/2 hidden sm:flex gap-2 z-10 bg-white/5 backdrop-blur-sm rounded-full p-2 sm:p-3 border border-white/10 max-w-[85vw] overflow-x-auto">
                {validImages.map((image, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 flex-shrink-0 touch-manipulation",
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
                      sizes="(max-width: 640px) 40px, 48px"
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
