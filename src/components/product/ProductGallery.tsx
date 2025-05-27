// src/components/product/ProductGallery.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaOptionsType, UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Expand, X as CloseIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from '../ui/button';

// ProductImageType removed as images prop is now string[]

interface ProductGalleryProps {
  images: string[]; // Changed to string[]
  title: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, title }) => {
  const options: EmblaOptionsType = { 
    loop: images.length > 1, 
    align: 'start' 
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(options); 
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    align: 'start',
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !emblaThumbsApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !emblaThumbsApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    if (emblaThumbsApi.scrollTo) { 
        emblaThumbsApi.scrollTo(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi, emblaThumbsApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); 
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect); 
    return () => {
      if (emblaApi && emblaApi.off) { 
        emblaApi.off('select', onSelect);
        emblaApi.off('reInit', onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  const openModal = (index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        Нет изображений
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div className="overflow-hidden rounded-lg border bg-card" ref={emblaRef}>
        <div className="flex">
          {images.map((imageString, index) => ( // image is now imageString
            <div
              className="relative aspect-square min-w-0 flex-[0_0_100%] cursor-pointer group"
              key={`gallery-main-${imageString}-${index}`} // Updated key
              onClick={() => openModal(index)}
            >
              <Image
                src={imageString} // Use imageString directly
                alt={`${title} - изображение ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                className="object-contain"
                priority={index === 0}
              />
              <div className="absolute bottom-3 right-3 p-2 bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Expand size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/70 hover:bg-background text-foreground shadow-md"
            onClick={scrollPrev}
            aria-label="Предыдущее изображение"
            disabled={!emblaApi?.canScrollPrev()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/70 hover:bg-background text-foreground shadow-md"
            onClick={scrollNext}
            aria-label="Следующее изображение"
            disabled={!emblaApi?.canScrollNext()}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Thumbnails Carousel */}
      {images.length > 1 && (
        <div className="mt-4 overflow-hidden" ref={emblaThumbsRef}>
          <div className="flex gap-3"> 
            {images.map((imageString, index) => ( // image is now imageString
              <button
                key={`gallery-thumb-${imageString}-${index}`} // Updated key
                onClick={() => onThumbClick(index)}
                className={cn(
                  'relative aspect-square h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden cursor-pointer flex-[0_0_auto] transition-opacity duration-200',
                  index === selectedIndex ? ' opacity-100' : 'opacity-60 hover:opacity-100'
                )}
                aria-label={`Перейти к изображению ${index + 1}`}
              >
                <Image
                  src={imageString} // Use imageString directly
                  alt={`${title} - миниатюра ${index + 1}`}
                  fill
                  sizes="80px" 
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Zoomed Image */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[95vh] p-2 sm:p-4 flex items-center justify-center bg-transparent border-0 shadow-none">
          <div className="relative w-full h-auto max-h-[88vh] aspect-auto z-10">
             {images[modalImageIndex] && ( // Check if imageString exists at index
              <Image
                src={images[modalImageIndex]} // Use imageString directly
                alt={`${title} - увеличенное изображение ${modalImageIndex + 1}`}
                width={1200} 
                height={1200} 
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 1000px"
                className="object-contain rounded-lg max-w-full max-h-[88vh]"
                style={{ width: 'auto', height: 'auto' }} 
              />
            )}
          </div>
          <DialogClose className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-1.5 bg-background/60 hover:bg-background/80 text-foreground opacity-80 hover:opacity-100 transition-all z-20">
            <CloseIcon className="h-5 w-5" />
            <span className="sr-only">Закрыть</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductGallery;
