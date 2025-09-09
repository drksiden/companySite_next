"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface SlideData {
  id: string;
  imageUrl: string;
  alt: string;
  title: string;
  description: string;
  catalogUrl: string;
}

interface ProductSectionProps {
  slides: SlideData[];
  brandName: string;
  brandLogoUrl?: string;
  brandLogoUrlDark: string | StaticImport;
  brandTagline: string;
  description: string;
  catalogLink: string;
  badgeText: string;
  sectionBgClass: string;
}

const Carousel: React.FC<{ slides: SlideData[] }> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const AUTO_INTERVAL = 5000;

  const changeSlide = useCallback(
    (newIndex: number) => {
      const newDirection = newIndex > currentSlide ? 1 : -1;
      if (newIndex < 0) newIndex = slides.length - 1;
      else if (newIndex >= slides.length) newIndex = 0;
      setDirection(newDirection);
      setCurrentSlide(newIndex);
    },
    [currentSlide, slides.length],
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(
      () => changeSlide(currentSlide + 1),
      AUTO_INTERVAL,
    );
    return () => clearTimeout(timer);
  }, [currentSlide, isPaused, changeSlide]);

  // CSS animation classes will handle transitions

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="h-10 mb-6 text-center">
        <h3
          key={`${currentSlide}-title`}
          className="text-2xl lg:text-3xl font-semibold text-blue-700 dark:text-blue-300 animate-fade-in"
        >
          {slides[currentSlide].title}
        </h3>
      </div>
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div
          key={`${currentSlide}-image`}
          className="absolute inset-0 flex items-center justify-center animate-fade-in"
        >
          <Link
            href={slides[currentSlide].catalogUrl}
            className="block w-full h-full group"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={slides[currentSlide].imageUrl}
                alt=""
                className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="flex justify-center mt-8 space-x-3 w-full max-w-md px-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => changeSlide(index)}
            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label={`Слайд ${index + 1}`}
          >
            <div
              className={`h-full bg-blue-500 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-full" : "w-0"
              }`}
              style={{
                transitionDuration:
                  currentSlide === index && !isPaused
                    ? `${AUTO_INTERVAL}ms`
                    : "300ms",
              }}
            />
          </button>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-600 dark:text-blue-100 min-h-16 px-4 max-w-xl mx-auto">
        <div key={`${currentSlide}-desc`} className="py-2 animate-fade-in">
          <p className="text-lg line-clamp-3 md:line-clamp-2">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>
    </div>
  );
};

export function ProductSection({
  slides,
  brandName,
  brandLogoUrl,
  brandLogoUrlDark,
  brandTagline,
  description,
  catalogLink,
  badgeText,
  sectionBgClass,
}: ProductSectionProps) {
  const [logoVisible, setLogoVisible] = useState(true);

  const renderBrandLogo = () => {
    if (!brandLogoUrl || !logoVisible) return null;
    const logoBgClass = brandName === "FLEXEM" ? "bg-gray-800" : "";
    return (
      <div className="flex items-center justify-center mb-4 animate-fade-in">
        <Image
          src={brandLogoUrl}
          alt={`${brandName} Logo`}
          width={150}
          height={72}
          className={`block dark:hidden h-14 md:h-18 w-auto object-contain ${logoBgClass} rounded-lg p-2`}
          onError={() => {
            console.warn(`Logo failed to load: "${brandLogoUrl}"`);
            setLogoVisible(false);
          }}
          onLoad={() =>
            console.log(`Logo loaded successfully: "${brandLogoUrl}"`)
          }
        />
        <Image
          src={brandLogoUrlDark}
          alt={`${brandName} Logo Dark`}
          width={150}
          height={72}
          className={`hidden dark:block h-14 md:h-18 w-auto object-contain ${logoBgClass} rounded-lg p-2`}
          onError={() => {
            console.warn(`Logo dark failed to load: "${brandLogoUrlDark}"`);
            setLogoVisible(false);
          }}
          onLoad={() =>
            console.log(`Logo dark loaded successfully: "${brandLogoUrlDark}"`)
          }
        />
      </div>
    );
  };

  return (
    <section
      className={`py-16 lg:py-24 px-4 ${sectionBgClass} w-full overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left opacity-0 animate-fade-in">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="opacity-0 animate-fade-in [animation-delay:100ms]">
                <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {badgeText}
                </Badge>
              </div>
              {renderBrandLogo()}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {brandTagline}{" "}
              <span className="text-blue-700 dark:text-blue-300">
                {brandName}
              </span>
            </h2>
            <p className="text-base text-gray-600 dark:text-blue-100 leading-relaxed opacity-0 animate-fade-in [animation-delay:200ms]">
              {description}
            </p>
            <div className="opacity-0 animate-fade-in [animation-delay:500ms]">
              <Button asChild className="group">
                <Link href={catalogLink} className="inline-flex items-center">
                  Смотреть продукцию {brandName}
                  <ExternalLink className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full opacity-0 animate-fade-in [animation-delay:200ms]">
            <Carousel slides={slides} />
          </div>
        </div>
      </div>
    </section>
  );
}
