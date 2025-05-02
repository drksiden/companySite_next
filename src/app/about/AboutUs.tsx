'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { COMPANY_NAME } from '@/data/constants';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-16 lg:py-20 px-4 bg-white dark:bg-gray-900 w-full overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 md:mb-12 text-center"
        >
          О Компании {COMPANY_NAME}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Колонка с изображением */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto md:max-w-none"
          >
            <Image
              src="/images/about/company_image.jpg" // Замените изображение
              alt={`Офис ${COMPANY_NAME}`}
              width={1024}
              height={678}
              className="rounded-xl shadow-xl w-full h-auto object-cover aspect-[4/3]"
              priority
            />
          </motion.div>

          {/* Колонка с текстом */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Ваш эксперт в безопасности с 20XX года
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  ТОО `{COMPANY_NAME}` является ведущим поставщиком и интегратором современных
                  систем безопасности и автоматизации в Казахстане. Мы специализируемся на комплексных решениях для
                  объектов любой сложности.
                </p>
                <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                  Основные направления деятельности:
                </h4>
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1 mb-4 pl-2">
                  <li>Торговые поставки оборудования для предотвращения и борьбы с пожарами.</li>
                  <li>Торговые поставки охранного и защитного оборудования.</li>
                  <li>Системы аварийной пожарной сигнализации и противопожарной защиты.</li>
                  <li>Оборудование оповещения и аварийной сигнализации.</li>
                  <li>Системы обнаружения вторжения, охранно-сигнальные системы.</li>
                  <li>Проектирование и монтаж автоматических систем пожарной сигнализации и пожаротушения.</li>
                  <li>Установка и техническое обслуживание систем безопасности.</li>
                  <li>Монтаж сигнализации о кражах со взломом.</li>
                  <li>Услуги установки замков.</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Наша миссия — обеспечить вашу безопасность, спокойствие и комфорт, используя передовые технологии и
                  многолетний опыт наших специалистов.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
