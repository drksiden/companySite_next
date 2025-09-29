"use client";

import React from "react";
import Image from "next/image";
import { partners } from "@/data/partners";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // Импорт CarouselNext и CarouselPrevious оставлен, но они будут скрыты
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
// !!! ВАЖНО: Убедитесь, что у вас установлен плагин Embla Autoplay
// npm install embla-carousel-autoplay
import Autoplay from "embla-carousel-autoplay"; 

export function PartnersCarousel() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Настройки плагина Autoplay
  const autoplayOptions = React.useRef(
    Autoplay({
      delay: 3500, // Задержка между слайдами: 3.5 секунды
      stopOnInteraction: false, // Продолжать проигрывание после взаимодействия пользователя
      stopOnMouseEnter: true, // Опционально: Останавливать, если курсор мыши над каруселью (для десктопа)
    })
  );

  return (
    <section className="py-16 px-6 bg-muted w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
          Наши партнёры
        </h2>

        {/* 1. Мобильная карусель (отображается до md) */}
        <div className="md:hidden w-full mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            // Добавляем плагин Autoplay
            plugins={[autoplayOptions.current]} 
          >
            <CarouselContent className="-ml-4">
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="basis-1/2 xs:basis-1/3 sm:basis-1/4 pl-4">
                  <motion.div
                    className="flex items-center justify-center"
                    variants={itemVariants}
                  >
                    <div className="h-[60px] w-full flex items-center justify-center p-2">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={200}
                        height={120}
                        className={cn(
                          "object-contain transition-all duration-300",
                          partner.darkLogo ? "hidden dark:block" : "",
                        )}
                      />
                      {partner.darkLogo && (
                        <Image
                          src={partner.darkLogo}
                          alt={`${partner.name} Dark Theme`}
                          width={200}
                          height={120}
                          className="object-contain transition-all duration-300 block dark:hidden"
                        />
                      )}
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Скрываем кнопки навигации на мобильном */}
            <CarouselPrevious className="hidden" />
            <CarouselNext className="hidden" />
          </Carousel>
        </div>

        {/* 2. Статичная сетка логотипов (отображается с md и выше) */}
        <motion.div
          className="hidden md:flex justify-center items-center gap-x-8 gap-y-6 flex-wrap"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              variants={itemVariants}
            >
              <div className="h-[60px] w-[200px] flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={200}
                  height={120}
                  className={cn(
                    "object-contain transition-all duration-300",
                    partner.darkLogo ? "hidden dark:block" : "",
                  )}
                />
                {partner.darkLogo && (
                  <Image
                    src={partner.darkLogo}
                    alt={`${partner.name} Dark Theme`}
                    width={200}
                    height={120}
                    className="object-contain transition-all duration-300 block dark:hidden"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}