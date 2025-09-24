"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="hero"
      className="relative text-center py-28 md:py-40 px-4 w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"
    >
      <motion.div
        className="relative z-10 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight text-white"
          variants={itemVariants}
        >
          Азия New Technology Build
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90"
          variants={itemVariants}
        >
          Профессиональный подход, разумное решение
        </motion.p>
        <motion.div
          variants={itemVariants}
        >
          <Button
            asChild
            size="lg"
            className="rounded-full px-6 py-3 transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <Link href="/contact">Получить консультацию</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}