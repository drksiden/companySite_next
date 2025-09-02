"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { services } from "@/data/services";
import { ArrowRight, ExternalLink } from "lucide-react";

export function ServicesGrid() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-20 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Полный спектр услуг
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            От проектирования до технического обслуживания — мы обеспечиваем
            комплексные решения для вашей безопасности и автоматизации
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3 },
                }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative group cursor-pointer"
              >
                {/* Main Card */}
                <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />

                  {/* Icon */}
                  <motion.div
                    animate={
                      isHovered
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.3 }}
                    className="relative z-10 bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {service.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {service.summary}
                    </p>

                    {/* Features list */}
                    <motion.div
                      className="space-y-2 mb-6"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ul className="space-y-1">
                        <li className="flex items-start text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0" />
                          <span>Профессиональное оборудование</span>
                        </li>
                        <li className="flex items-start text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0" />
                          <span>Гарантия качества</span>
                        </li>
                        <li className="flex items-start text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-2 flex-shrink-0" />
                          <span>Техническая поддержка</span>
                        </li>
                      </ul>
                    </motion.div>

                    {/* Action button */}
                    <motion.div
                      className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300"
                      animate={isHovered ? { x: 5 } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span>Подробнее</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.div>
                  </div>

                  {/* Corner decoration */}
                  <motion.div
                    className="absolute top-4 right-4 w-8 h-8 border-2 border-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={isHovered ? { rotate: 45 } : { rotate: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Floating detail overlay */}
                {isHovered && (
                  <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/95 to-purple-600/95 rounded-3xl p-8 text-white z-20 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Icon className="w-12 h-12 text-white/80" />
                      <ExternalLink className="w-5 h-5 text-white/60" />
                    </div>

                    <h3 className="text-2xl font-bold mb-4">{service.title}</h3>

                    <div className="text-white/90 space-y-3">
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 mr-2 flex-shrink-0" />
                          <span>Современные технологии</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 mr-2 flex-shrink-0" />
                          <span>Быстрая установка</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 mr-2 flex-shrink-0" />
                          <span>Полная документация</span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 mr-2 flex-shrink-0" />
                          <span>Обслуживание 24/7</span>
                        </li>
                      </ul>
                    </div>

                    <div className="absolute bottom-6 right-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Не нашли нужную услугу? Мы решаем нестандартные задачи
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            Получить консультацию
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
