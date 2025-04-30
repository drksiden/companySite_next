'use client';

import Image from 'next/image';
import { useState } from 'react';
import Slider, { Settings } from 'react-slick';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Интерфейс для пропсов
interface ProductGalleryProps {
  images: { url: string }[];
  title: string;
}

// Кастомные стрелки для слайдера
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
    onClick={onClick}
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
    onClick={onClick}
  >
    <ChevronRight className="w-5 h-5" />
  </button>
);

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-muted-foreground">Изображения отсутствуют</p>
      </div>
    );
  }

  const sliderSettings: Settings = {
    dots: true,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    className: 'product-gallery-slider',
    adaptiveHeight: false,
  };

  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden rounded-xl shadow-md bg-white">
      <Slider {...sliderSettings}>
        {images.map((image, index) => (
          <div key={index} className="relative w-full h-0 pb-[75%] cursor-zoom-in">
            <button
              onClick={() => setSelectedImage(image.url)}
              className="absolute inset-0"
              aria-label={`Открыть изображение ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`${title} - изображение ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 600px"
                className="rounded-xl"
                priority={index === 0}
              />
            </button>
          </div>
        ))}
      </Slider>

      {/* Модальное окно с изображением */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogTitle/>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none">
          <div className="relative w-full h-0 pb-[75%]">
            {selectedImage && (
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${title} - увеличенное изображение`}
                fill
                style={{ objectFit: 'contain' }}
                sizes="90vw"
                className="rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
