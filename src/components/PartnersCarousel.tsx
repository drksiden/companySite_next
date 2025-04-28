'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { partners } from '@/data/partners'; // Убедитесь, что путь к данным верный

export function PartnersCarousel() {
  const controls = useAnimationControls();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = async () => {
      controls.set({ x: 0 });
      await controls.start({
        x: `-${partners.length * 280}px`,
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: partners.length * 2,
            ease: 'linear',
          },
        },
      });
    };
    animate();
  }, [controls]);

  return (
    <section className="py-16 px-6 bg-muted w-full">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
          Наши партнёры
        </h2>
        <div className="overflow-hidden">
          <motion.div
            ref={ref}
            animate={controls}
            className="flex"
            style={{ minWidth: `${partners.length * 280 * 2}px` }}
          >
            {[...partners, ...partners].map((partner, index) => (
              <motion.div
                key={`${partner.id}-${index}`}
                className="flex-shrink-0 w-[280px] p-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={220}
                      height={140}
                      className="h-36 w-auto object-contain grayscale hover:grayscale-0 transition duration-300"
                    />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}