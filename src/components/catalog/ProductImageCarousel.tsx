"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight,
} from "@/components/icons/SimpleIcons";

interface ProductImageCarouselProps {
  images: string[];
  productName: string;
  className?: string;
}

export function ProductImageCarousel({
  images,
  productName,
  className,
}: ProductImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel({
    loop: false,
    align: "center",
  });

  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    loop: false,
    align: "start",
  });

  const [emblaFullscreenRef, emblaFullscreenApi] = useEmblaCarousel({
    loop: true,
    align: "center",
  });

  // Фильтруем валидные изображения
  const validImages = images.filter((img) => img && img.trim() !== "");

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return;
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  const onFullscreenSelect = useCallback(() => {
    if (!emblaFullscreenApi) return;
    setSelectedIndex(emblaFullscreenApi.selectedScrollSnap());
  }, [emblaFullscreenApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) return;
    onSelect();
    emblaMainApi.on("select", onSelect);
    emblaMainApi.on("reInit", onSelect);
  }, [emblaMainApi, onSelect]);

  useEffect(() => {
    if (!emblaFullscreenApi) return;
    onFullscreenSelect();
    emblaFullscreenApi.on("select", onFullscreenSelect);
    emblaFullscreenApi.on("reInit", onFullscreenSelect);
  }, [emblaFullscreenApi, onFullscreenSelect]);

  useEffect(() => {
    if (isFullscreen && emblaFullscreenApi) {
      emblaFullscreenApi.scrollTo(selectedIndex);
    }
  }, [isFullscreen, emblaFullscreenApi, selectedIndex]);

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollPrev();
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) emblaMainApi.scrollNext();
  }, [emblaMainApi]);

  const scrollFullscreenPrev = useCallback(() => {
    if (emblaFullscreenApi) emblaFullscreenApi.scrollPrev();
  }, [emblaFullscreenApi]);

  const scrollFullscreenNext = useCallback(() => {
    if (emblaFullscreenApi) emblaFullscreenApi.scrollNext();
  }, [emblaFullscreenApi]);

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
    <div className={cn("space-y-4", className)}>
      {/* Основное изображение */}
      <div className="relative">
        <div className="overflow-hidden rounded-lg" ref={emblaMainRef}>
          <div className="flex">
            {validImages.map((image, index) => (
              <div
                key={index}
                className="flex-[0_0_100%] min-w-0 relative aspect-square"
              >
                <Image
                  src={image}
                  alt={`${productName} - изображение ${index + 1}`}
                  fill
                  className="object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  priority={index === 0}
                  onClick={() => setIsFullscreen(true)}
                  unoptimized={image.includes("r2.dev")}
                  onError={() => console.error(`Failed to load image: ${image}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Кнопка увеличения */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 h-10 w-10 p-0 opacity-80 hover:opacity-100 backdrop-blur-sm"
          onClick={() => setIsFullscreen(true)}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        {/* Навигационные стрелки */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 opacity-80 hover:opacity-100 backdrop-blur-sm"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 opacity-80 hover:opacity-100 backdrop-blur-sm"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Индикатор изображения */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Миниатюры */}
      {validImages.length > 1 && (
        <div className="overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-2">
            {validImages.map((image, index) => (
              <button
                key={index}
                className={cn(
                  "relative flex-[0_0_auto] w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                  index === selectedIndex
                    ? "border-primary shadow-lg"
                    : "border-muted hover:border-primary/50",
                )}
                onClick={() => onThumbClick(index)}
              >
                <Image
                  src={image}
                  alt={`${productName} миниатюра ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized={image.includes("r2.dev")}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Полноэкранная галерея */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[90vh] p-0 [&>button]:hidden bg-black/95 border-0">
          <VisuallyHidden>
            <DialogTitle>Просмотр изображения {productName}</DialogTitle>
          </VisuallyHidden>

          <div className="relative w-full h-full bg-transparent overflow-hidden">
            {/* Основная карусель в полноэкранном режиме */}
            <div className="overflow-hidden h-full" ref={emblaFullscreenRef}>
              <div className="flex h-full">
                {validImages.map((image, index) => (
                  <div
                    key={index}
                    className="flex-[0_0_100%] min-w-0 relative h-full"
                  >
                    <Image
                      src={image}
                      alt={`${productName} - полный размер ${index + 1}`}
                      fill
                      className="object-contain p-8"
                      sizes="95vw"
                      unoptimized={image.includes("r2.dev")}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Кнопка закрытия */}
            <button
              className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center z-20 transition-all duration-200 hover:scale-105 border border-white/20"
              onClick={() => setIsFullscreen(false)}
              aria-label="Закрыть галерею"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Навигация в полноэкранном режиме */}
            {validImages.length > 1 && (
              <>
                <button
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center z-10 transition-all duration-200 hover:scale-105 border border-white/20"
                  onClick={scrollFullscreenPrev}
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white flex items-center justify-center z-10 transition-all duration-200 hover:scale-105 border border-white/20"
                  onClick={scrollFullscreenNext}
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Индикатор в полноэкранном режиме */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm z-10 border border-white/20">
                  {selectedIndex + 1} / {validImages.length}
                </div>

                {/* Миниатюры в полноэкранном режиме */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="flex gap-2 max-w-sm overflow-x-auto bg-white/5 backdrop-blur-sm rounded-full p-3 border border-white/10">
                    {validImages.map((image, index) => (
                      <button
                        key={index}
                        className={cn(
                          "relative flex-shrink-0 w-14 h-14 rounded-lg border-2 overflow-hidden transition-all hover:scale-105",
                          index === selectedIndex
                            ? "border-white shadow-lg shadow-white/25"
                            : "border-white/30 hover:border-white/60",
                        )}
                        onClick={() => emblaFullscreenApi?.scrollTo(index)}
                      >
                        <Image
                          src={image}
                          alt={`${productName} миниатюра ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized={image.includes("r2.dev")}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
