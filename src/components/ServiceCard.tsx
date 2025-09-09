"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, CheckCircle } from "lucide-react";
import { ServiceDetail } from "@/data/services";

interface ServiceCardProps {
  service: ServiceDetail;
  index: number;
  onLearnMore?: (serviceId: string) => void;
}

export function ServiceCard({ service, index, onLearnMore }: ServiceCardProps) {
  const Icon = service.icon;

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
        delay: index * 0.1,
      },
    },
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  const arrowVariants = {
    hover: {
      x: 5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover="hover"
      className="group cursor-pointer h-full"
      onClick={() => onLearnMore?.(service.id)}
    >
      <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 h-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
        {/* Gradient overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />

        {/* Animated background decoration */}
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            variants={iconVariants}
            className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-blue-600 transition-colors duration-300">
            {service.title}
          </h3>

          {/* Summary */}
          <p
            className="text-muted-foreground leading-relaxed mb-6 overflow-hidden"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {service.summary}
          </p>

          {/* Features preview */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Профессиональное оборудование</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              <span>Гарантия качества</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
              <span>Быстрая реализация</span>
            </div>
          </div>

          {/* Action button */}
          <motion.div
            variants={arrowVariants}
            className="flex items-center justify-between"
          >
            <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-300">
              <span>Подробнее</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>

            {/* Price/Duration indicator */}
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              Консультация бесплатно
            </div>
          </motion.div>

          {/* Subcategories preview */}
          {service.subcategories && service.subcategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-xs text-muted-foreground mb-2">
                Направления:
              </div>
              <div className="flex flex-wrap gap-1">
                {service.subcategories.slice(0, 2).map((sub, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full"
                  >
                    {sub.length > 30 ? sub.substring(0, 30) + "..." : sub}
                  </span>
                ))}
                {service.subcategories.length > 2 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{service.subcategories.length - 2} еще
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hover effect indicator */}
        <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </motion.div>
  );
}
