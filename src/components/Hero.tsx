'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { COMPANY_NAME } from '@/data/constants';

export function Hero() {
  return (
    <section
      id="hero"
      className="relative text-center py-28 md:py-40 px-4 w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight text-white"
        >
          {COMPANY_NAME}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90"
        >
          Профессиональный подход, разумное решение
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            asChild
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-6 py-3 transition-colors duration-300"
          >
            <Link href="/contact">Получить консультацию</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}