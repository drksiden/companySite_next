"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { partners } from "@/data/partners";

export function PartnersCarousel() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Server-side render: static layout
    return (
      <section className="py-16 px-6 bg-muted w-full">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
            Наши партнёры
          </h2>
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {partners.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 w-[220px] p-4"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={144}
                  className="h-36 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                  style={{
                    color: "transparent",
                    width: "auto",
                    height: "144px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Client-side render: with animations
  return (
    <section className="py-16 px-6 bg-muted w-full">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center animate-fade-in">
          Наши партнёры
        </h2>
        <div className="overflow-hidden">
          <div
            className="flex animate-scroll-infinite"
            style={{
              width: `${partners.length * 280 * 2}px`,
            }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 w-[280px] p-4 hover:scale-105 transition-transform duration-300"
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={220}
                  height={144}
                  className="h-36 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                  style={{
                    color: "transparent",
                    width: "auto",
                    height: "144px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
