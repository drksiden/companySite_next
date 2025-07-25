'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function PromoCard() {
  return (
    <section className="py-16 px-6">
      <Card className="bg-primary/10 border-border shadow-md rounded-lg">
        <CardContent className="max-w-5xl mx-auto text-center flex flex-col items-center py-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <ShieldCheck className="h-20 w-20 text-primary mb-6" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold mb-5 text-foreground"
          >
            Комплексные Решения Безопасности
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl"
          >
            От проектирования и подбора оборудования до монтажа и обслуживания — мы обеспечиваем полный цикл работ для вашей уверенности.
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-full px-6 py-3 transition-colors duration-300"
            >
              <Link href="/catalog">Смотреть каталог</Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </section>
  );
}