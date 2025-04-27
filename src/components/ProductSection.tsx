'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

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
    [currentSlide, slides.length]
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = setTimeout(() => changeSlide(currentSlide + 1), AUTO_INTERVAL);
    return () => clearTimeout(timer);
  }, [currentSlide, isPaused, changeSlide]);

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 200 : -200, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 200 : -200, opacity: 0 }),
  };

  const textVariants = {
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut', delay: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
  };

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
            initial="exit"
            animate="enter"
            exit="exit"
          >
            {slides[currentSlide].title}
          </motion.h3>
        </AnimatePresence>
      </div>
      <div className="relative w-full max-w-2xl aspect-[4/3] bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-300/30 dark:hover:shadow-gray-700/30">
        <div className="absolute inset-0  opacity-5 dark:opacity-10 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/20 to-transparent dark:from-gray-900/20 z-10 pointer-events-none" />
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={`${currentSlide}-image`}
            className="absolute inset-0 flex items-center justify-center"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.3 } }}
          >
            <Link href={slides[currentSlide].catalogUrl} className="block w-full h-full group">
              <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="absolute w-64 h-64 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-xl transform transition-all duration-500 group-hover:scale-110" />
                <Image
                    src={slides[currentSlide].imageUrl}
                    alt={slides[currentSlide].alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw" // Это пример, ты можешь адаптировать для своей ситуации
                    className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md dark:drop-shadow-lg z-10"
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
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: currentSlide === index ? '100%' : '0%' }}
              transition={{ duration: currentSlide === index && !isPaused ? AUTO_INTERVAL / 1000 : 0.4, ease: 'linear' }}
              key={`${currentSlide}-${index}-${isPaused}`}
            />
          </button>
        ))}
      </div>
      <div className="mt-8 text-center text-gray-600 dark:text-blue-100 min-h-16 px-4 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentSlide}-desc`}
            variants={textVariants}
            initial="exit"
            animate="enter"
            exit="exit"
            className="py-2"
          >
            <p className="text-lg line-clamp-3 md:line-clamp-2">{slides[currentSlide].description}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export function ProductSection({
  slides,
  brandName,
  brandLogoUrl,
  brandTagline,
  description,
  catalogLink,
  badgeText,
  sectionBgClass,
}: ProductSectionProps) {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
  };

  const [logoVisible, setLogoVisible] = useState(true);

  const renderBrandLogo = () => {
    if (!brandLogoUrl || !logoVisible) return null;
    const logoBgClass = brandName === 'FLEXEM' ? 'bg-gray-800' : '';
    return (
      <motion.div
        className="flex items-center justify-center mb-4"
        custom={2}
        variants={sectionVariants}
      >
        <Image
          src={brandLogoUrl}
          alt={`${brandName} Logo`}
          width={150}
          height={72}
          className={`h-14 md:h-18 w-auto object-contain ${logoBgClass} rounded-lg p-2`}
          onError={() => setLogoVisible(false)}
        />
      </motion.div>
    );
  };

  return (
    <section className={`py-16 lg:py-24 px-4 ${sectionBgClass} w-full overflow-hidden`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            className="space-y-6 text-center lg:text-left"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
            custom={0}
          >
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <motion.div custom={1} variants={sectionVariants}>
                <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {badgeText}
                </Badge>
              </motion.div>
              {renderBrandLogo()}
            </div>
            <motion.h2
              className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight"
              custom={3}
              variants={sectionVariants}
            >
              {brandTagline} <span className="text-blue-700 dark:text-blue-300">{brandName}</span>
            </motion.h2>
            <motion.p
              className="text-base text-gray-600 dark:text-blue-100 leading-relaxed"
              custom={4}
              variants={sectionVariants}
            >
              {description}
            </motion.p>
            <motion.div custom={5} variants={sectionVariants}>
              <Button asChild className="group">
                <Link href={catalogLink} className="inline-flex items-center">
                  Смотреть продукцию {brandName}
                  <ExternalLink className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full"
          >
            <Carousel slides={slides} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
