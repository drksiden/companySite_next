'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  'Проектирование',
  'Подбор оборудования',
  'Профессиональный монтаж',
  'Техническое обслуживание',
];

export function PromoCard() {
  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Card className="border-2 border-blue-200/50 dark:border-blue-800/50 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white mb-6 shadow-lg"
                >
                  <ShieldCheck className="h-10 w-10" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white"
                >
                  Комплексные Решения{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Безопасности
                  </span>
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
                >
                  От проектирования и подбора оборудования до монтажа и обслуживания — мы обеспечиваем полный цикл работ для вашей уверенности.
                </motion.p>

                {/* Features list */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 gap-4 mb-8"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm md:text-base font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button
                    asChild
                    className="group rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-600/30 dark:border-blue-500/30"
                  >
                    <Link href="/catalog" className="inline-flex items-center gap-2">
                      Смотреть каталог
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right side - Visual element */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative hidden lg:block"
              >
                <div className="relative w-full aspect-square">
                  {/* Animated circles */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-4 border-blue-200 dark:border-blue-800"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      scale: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [360, 0],
                    }}
                    transition={{
                      scale: {
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotate: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                      }
                    }}
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className="w-16 h-16 text-white" />
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
