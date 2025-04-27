'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const COMPANY_NAME = 'Your Company'; // Замените на ваше значение

export function Hero() {
  return (
    <section
      id="hero"
      className="relative text-white text-center py-28 md:py-40 px-4 w-full overflow-hidden bg-gray-800"
    >
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-800/70"></div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight"
        >
          {COMPANY_NAME}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
        >
          Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl">
            <Link href="/contact">Получить консультацию</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}