"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section
      id="hero"
      className="relative text-center py-20 md:py-32 px-4 w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      <motion.div
        className="relative z-10 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium"
        >
          <Shield className="w-4 h-4" />
          <span>Системная интеграция и безопасность</span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight text-white"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="block bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
            Азия New Technology Build
          </span>
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl lg:text-3xl mb-4 max-w-3xl mx-auto text-white/95 font-medium"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Профессиональный подход, разумное решение
        </motion.p>

        <motion.p
          className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-white/80 leading-relaxed"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Комплексные решения в области систем безопасности, автоматизации и сетевого оборудования для объектов любой сложности
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button
            asChild
            size="lg"
            className="group rounded-full px-8 py-6 text-lg font-semibold bg-white text-blue-900 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
          >
            <Link href="/contacts" className="inline-flex items-center gap-2">
              Получить консультацию
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="group rounded-full px-8 py-6 text-lg font-semibold bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Link href="/catalog" className="inline-flex items-center gap-2">
              Смотреть каталог
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>

        {/* Features */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto"
        >
          {[
            { icon: Shield, text: "Официальные дилеры" },
            { icon: Zap, text: "Быстрая установка" },
            { icon: Users, text: "Профессиональная поддержка" },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="p-3 rounded-full bg-white/10">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/90 font-medium text-sm text-center">
                  {feature.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
}