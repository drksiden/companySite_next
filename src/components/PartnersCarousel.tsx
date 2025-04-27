'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { partners } from '@/data/partners'; // Убедитесь, что путь к данным верный

export function PartnersCarousel() {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = async () => {
      await controls.start({
        x: '-100%',
        transition: { duration: 20, ease: 'linear', repeat: Infinity },
      });
      controls.set({ x: 0 });
    };
    animate();
  }, [controls]);

  return (
    <section className="py-12 px-4 bg-muted w-full">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">
          Наши партнёры
        </h2>
        <div className="overflow-hidden">
          <motion.div
            ref={ref}
            animate={controls}
            className="flex"
            style={{ width: `${partners.length * 200}px` }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                className="flex flex-col items-center justify-center p-4 mx-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  width={150}
                  height={96}
                  className="h-24 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}