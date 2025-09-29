"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  tekoSlides,
  flexemSlides,
  antSlides,
  ProductSlide,
} from "@/data/productSlides";

interface ProductSectionProps {
  sectionType: "teko" | "flexem" | "ant";
}

const slideVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const textVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const Carousel = ({ slides }: { slides: ProductSlide[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const AUTO_INTERVAL = 5000;

  const changeSlide = useCallback(
    (newIndex: number) => {
      if (newIndex < 0) newIndex = slides.length - 1;
      else if (newIndex >= slides.length) newIndex = 0;
      setCurrentSlide(newIndex);
    },
    [slides.length],
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(
      () => changeSlide(currentSlide + 1),
      AUTO_INTERVAL,
    );
    return () => clearTimeout(timer);
  }, [currentSlide, isPaused, changeSlide, AUTO_INTERVAL]);

  return (
    <div
      className="flex flex-col items-center w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="h-10 mb-6 text-center">
        <AnimatePresence mode="wait">
          <motion.h3
            key={`${currentSlide}-title`}
            className="text-2xl lg:text-3xl font-semibold text-blue-700 dark:text-blue-300"
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            {slides[currentSlide].title}
          </motion.h3>
        </AnimatePresence>
      </div>
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSlide}-image`}
            className="absolute inset-0 flex items-center justify-center"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <Link
              href={slides[currentSlide].catalogUrl}
              className="block w-full h-full group"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={slides[currentSlide].imageUrl}
                  alt={slides[currentSlide].alt}
                  fill
                  sizes={slides[currentSlide].sizes}
                  priority={slides[currentSlide].priority}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
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
            />
          </button>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-600 dark:text-blue-100 min-h-16 px-4 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${currentSlide}-desc`}
            className="text-lg line-clamp-3 md:line-clamp-2"
            variants={textVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            {slides[currentSlide].description}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export function ProductSection({ sectionType }: ProductSectionProps) {
  const [logoVisible, setLogoVisible] = useState(true);

  let slides,
    brandName,
    brandLogoUrl,
    brandLogoUrlDark,
    brandTagline,
    description,
    catalogLink,
    badgeText,
    sectionBgClass;

  switch (sectionType) {
    case "teko":
      slides = tekoSlides;
      brandName = "TEKO";
      brandLogoUrl = "/images/logos/teko-logo.svg";
      brandLogoUrlDark = "/images/logos/teko-logo.svg";
      brandTagline = "Надежные Системы Безопасности";
      description =
        'Полный спектр оборудования НПО "ТЕКО" в Казахстане. От радиоканальных систем "Астра" до адресных решений для защиты вашего объекта.';
      catalogLink = "/catalog/manufacturer/teko";
      badgeText = "Официальный дилер";
      sectionBgClass = "bg-gray-50 dark:bg-gray-900";
      break;
    case "flexem":
      slides = flexemSlides;
      brandName = "FLEXEM";
      brandLogoUrl = "/images/logos/flexem-logo-white.png";
      brandLogoUrlDark = "/images/logos/flexem-logo-white.png";
      brandTagline = "Инновационные Решения";
      description =
        "Современное оборудование FLEXEM для автоматизации и управления. Надежные HMI-панели и IoT-решения для промышленности и бизнеса в Казахстане.";
      catalogLink = "/catalog/manufacturer/flexem";
      badgeText = "Официальный дистрибьютор";
      sectionBgClass = "bg-white dark:bg-gray-800";
      break;
    case "ant":
      slides = antSlides;
      brandName = "ANT";
      brandLogoUrl = "/images/logos/ant-logo-light.svg";
      brandLogoUrlDark = "/images/logos/ant-logo-dark.svg";
      brandTagline = "Сетевое Оборудование";
      description =
        "Профессиональные решения ANT для создания надежных и масштабируемых сетевых инфраструктур.";
      catalogLink = "/catalog/manufacturer/ant";
      badgeText = "Сетевые решения";
      sectionBgClass = "bg-gray-50 dark:bg-gray-900";
      break;
    default:
      return null;
  }

  const renderBrandLogo = () => {
    if (!brandLogoUrl || !logoVisible) return null;
    const logoBgClass = brandName === "FLEXEM" ? "bg-gray-800" : "";
    return (
      <motion.div
        className="flex items-center justify-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
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
      </motion.div>
    );
  };

  return (
    <section
      className={`py-16 lg:py-24 px-4 ${sectionBgClass} w-full overflow-hidden`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {badgeText}
                </Badge>
              </motion.div>
              {renderBrandLogo()}
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
              {brandTagline}{" "}
              <span className="text-blue-700 dark:text-blue-300">
                {brandName}
              </span>
            </h2>
            <motion.p
              className="text-base text-gray-600 dark:text-blue-100 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button asChild className="group">
                <Link href={catalogLink} className="inline-flex items-center">
                  Смотреть продукцию {brandName}
                  <ExternalLink className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Carousel slides={slides} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
