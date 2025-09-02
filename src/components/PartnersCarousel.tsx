"use client";

import React from "react";
import Image from "next/image";
import { partners } from "@/data/partners";

export function PartnersCarousel() {
  return (
    <section className="py-16 px-6 bg-muted w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
          Наши партнёры
        </h2>

        {/* Desktop version - flex wrap */}
        <div className="hidden md:flex justify-center items-center gap-8 flex-wrap">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex-shrink-0 w-[200px] p-6 hover:scale-105 transition-transform duration-300 bg-background rounded-lg shadow-sm hover:shadow-md"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={200}
                height={120}
                className="h-24 w-auto object-contain mx-auto grayscale hover:grayscale-0 transition-all duration-300"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>
          ))}
        </div>

        {/* Mobile version - simple grid */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="p-4 bg-background rounded-lg shadow-sm"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={150}
                height={90}
                className="h-16 w-auto object-contain mx-auto grayscale"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
