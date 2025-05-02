'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Slider, { Settings } from 'react-slick';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

// Импорт стилей для Slick-slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { VisuallyHidden } from '../ui/visually-hidden';

// Интерфейс для пропсов
interface ProductGalleryProps {
  images: { url: string }[];
  title: string;
}

// Кастомные стрелки для слайдера
const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full text-black hover:bg-white transition shadow-md"
    onClick={onClick}
    aria-label="Предыдущее изображение"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button
    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/70 p-2 rounded-full text-black hover:bg-white transition shadow-md"
    onClick={onClick}
    aria-label="Следующее изображение"
  >
    <ChevronRight className="w-5 h-5" />
  </button>
);

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mainSlider, setMainSlider] = useState<any>(null);
  const [thumbnailSlider, setThumbnailSlider] = useState<any>(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-muted-foreground">Изображения отсутствуют</p>
      </div>
    );
  }

  const mainSliderSettings: Settings = {
    dots: false,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    asNavFor: thumbnailSlider,
    fade: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          dots: true,
        }
      }
    ]
  };

  const thumbnailSettings: Settings = {
    dots: false,
    infinite: images.length > 4,
    speed: 500,
    slidesToShow: Math.min(5, images.length),
    slidesToScroll: 1,
    swipeToSlide: true,
    focusOnSelect: true,
    arrows: false,
    asNavFor: mainSlider,
    centerMode: images.length > 4,
    centerPadding: '0px',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(4, images.length),
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: Math.min(3, images.length),
        }
      }
    ]
  };

  return (
    <div className="w-full mx-auto bg-none rounded-xl shadow-sm">
      {mounted && (
        <div className="product-gallery">
          <style jsx global>{`
            /* Основные стили для слайдера */
            .product-gallery .slick-slider {
              position: relative;
              display: block;
              box-sizing: border-box;
              user-select: none;
              touch-action: pan-y;
              -webkit-tap-highlight-color: transparent;
            }
            
            .product-gallery .slick-list {
              position: relative;
              display: block;
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
            
            .product-gallery .slick-track {
              position: relative;
              top: 0;
              left: 0;
              display: flex;
              margin-left: auto;
              margin-right: auto;
            }

            /* Стили для основного слайдера */
            .product-gallery .main-slider .slick-slide {
              height: 450px;
              display: flex !important;
              align-items: center;
              justify-content: center;
            }
            
            /* Стили для миниатюр */
            .product-gallery .thumbnail-slider {
              margin-top: 12px;
            }
            
            .product-gallery .thumbnail-slider .slick-slide {
              padding: 3px;
              opacity: 0.7;
              transition: all 0.3s ease;
              cursor: pointer;
            }
            
            .product-gallery .thumbnail-slider .slick-current {
              opacity: 1;
            }
            
            .product-gallery .thumbnail-slider .thumb-item {
              border: 2px solid transparent;
              border-radius: 6px;
              overflow: hidden;
            }
            
            .product-gallery .thumbnail-slider .slick-current .thumb-item {
              border-color: #4f46e5;
            }
            
            /* Стили для точек (dots) на мобильных */
            .product-gallery .slick-dots {
              position: absolute;
              bottom: 10px;
              display: flex !important;
              justify-content: center;
              width: 100%;
              padding: 0;
              margin: 0;
              list-style: none;
              z-index: 1;
            }
            
            .product-gallery .slick-dots li {
              margin: 0 4px;
            }
            
            .product-gallery .slick-dots li button {
              font-size: 0;
              width: 8px;
              height: 8px;
              padding: 0;
              border: 0;
              border-radius: 50%;
              background-color: rgba(0, 0, 0, 0.3);
              cursor: pointer;
            }
            
            .product-gallery .slick-dots li.slick-active button {
              background-color: #4f46e5;
              transform: scale(1.2);
            }
            
            /* Кнопка зума */
            .zoom-button {
              position: absolute;
              bottom: 10px;
              right: 10px;
              background-color: rgba(0, 0, 0, 0.432);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 36px;
              height: 36px;
              cursor: pointer;
              transition: all 0.2s ease;
              z-index: 5;
              opacity: 0;
            }
            
            .main-slider .slick-slide:hover .zoom-button {
              opacity: 1;
            }
          `}</style>
          
          {/* Основной слайдер */}
          <div className="main-slider">
            <Slider 
              {...mainSliderSettings} 
              ref={slider => setMainSlider(slider)}
            >
              {images.map((image, index) => (
                <div key={index} className="relative w-full h-full px-2">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={image.url}
                      alt={`${title} - изображение ${index + 1}`}
                      width={600}
                      height={450}
                      style={{ objectFit: 'contain', maxHeight: '450px' }}
                      sizes="(max-width: 768px) 100vw, 600px"
                      className="rounded-lg"
                      priority={index === 0}
                    />
                    <button 
                      className="zoom-button shadow-md"
                      onClick={() => setSelectedImage(image.url)}
                      aria-label="Увеличить изображение"
                    >
                      <ZoomIn size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
          
          {/* Слайдер с миниатюрами */}
          {images.length > 1 && (
            <div className="thumbnail-slider">
              <Slider 
                {...thumbnailSettings} 
                ref={slider => setThumbnailSlider(slider)}
              >
                {images.map((image, index) => (
                  <div key={index} className="px-1">
                    <div className="thumb-item">
                      <div className="relative w-full pb-[75%]">
                        <Image
                          src={image.url}
                          alt={`${title} - миниатюра ${index + 1}`}
                          fill
                          sizes="100px"
                          style={{ objectFit: 'contain', maxHeight: '450px' }}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно с изображением */}
      <Dialog 
        open={!!selectedImage} 
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-5xl p-4 bg-white border-none shadow-xl rounded-xl">
          <VisuallyHidden>
            <DialogTitle>Просмотр изображения: {title}</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full aspect-[4/3] max-h-[80vh]">
            {selectedImage && (
              <Image
                key={selectedImage}
                src={selectedImage}
                alt={`${title} - увеличенное изображение`}
                fill
                style={{ objectFit: 'contain' }}
                sizes="90vw"
                className="rounded-lg"
                priority
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}