"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn, X, Package } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isOnSale?: boolean;
  discountPercentage?: number;
}

export default function ProductImageGallery({
  images,
  productName,
  isOnSale = false,
  discountPercentage = 0,
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const hasImages = images.length > 0;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    } else {
      setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (event.key === 'ArrowRight') {
      navigateImage('next');
    } else if (event.key === 'Escape') {
      setIsZoomOpen(false);
    }
  };

  if (!hasImages) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Нет изображений</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
        <Image
          src={images[selectedImageIndex]}
          alt={`${productName} - изображение ${selectedImageIndex + 1}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Sale Badge */}
        {isOnSale && discountPercentage > 0 && (
          <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white z-10">
            -{discountPercentage}%
          </Badge>
        )}

        {/* Zoom Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-4 right-4 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={() => setIsZoomOpen(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => navigateImage('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => navigateImage('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square bg-muted rounded-md overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                selectedImageIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
            >
              <Image
                src={image}
                alt={`${productName} миниатюра ${index + 1}`}
                width={100}
                height={100}
                className="object-cover w-full h-full"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent
          className="max-w-4xl w-full h-[80vh] p-0 bg-black/95"
          onKeyDown={handleKeyDown}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-20"
              onClick={() => setIsZoomOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Main Zoom Image */}
            <div className="relative w-full h-full">
              <Image
                src={images[selectedImageIndex]}
                alt={`${productName} - увеличенное изображение`}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
            </div>

            {/* Navigation in Zoom */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter in Zoom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-20">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail Strip in Zoom */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 z-20">
                <div className="flex justify-center gap-2 max-w-md mx-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-12 h-12 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                        selectedImageIndex === index
                          ? "border-white"
                          : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Миниатюра ${index + 1}`}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
