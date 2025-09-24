"use client";

import React from "react";
import Image from "next/image";
import { partners } from "@/data/partners";
import { motion } from "framer-motion";

export function PartnersCarousel() {
  return (
    <section className="py-16 px-6 bg-muted w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
          Наши партнёры
        </h2>
        {/* Статичная сетка логотипов с анимацией при наведении */}
        <div className="flex justify-center items-center gap-x-8 gap-y-6 flex-wrap">
          {partners.map((partner) => (
            <motion.div
              key={partner.id}
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="h-[60px] w-[200px] flex items-center justify-center">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={200}
                  height={120}
                  className={`object-contain transition-all duration-300 ${
                    partner.darkLogo ? "hidden dark:block" : ""
                  }`}
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
        </div>
      </div>
    </section>
  );
}
