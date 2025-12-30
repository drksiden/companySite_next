"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Flame,
  Zap,
  Cpu,
  Video,
  Wrench,
  ClipboardList,
} from "lucide-react";

const services = [
  {
    id: "security-alarm",
    title: "Охранная сигнализация",
    description:
      "Системы для защиты объектов с датчиками движения и интеграцией.",
    icon: Shield, // Add an icon here
  },
  {
    id: "fire-alarm",
    title: "Пожарная сигнализация",
    description: "Датчики дыма и тепла для раннего обнаружения пожаров.",
    icon: Flame, // Add an icon here
  },
  {
    id: "fire-equipment",
    title: "Оборудование для пожаротушения",
    description: "Спринклеры, газовые системы и огнетушители.",
    icon: Zap, // Add an icon here
  },
  {
    id: "automation-electronics",
    title: "Электроника для автоматизации",
    description: "Контроллеры и реле для умных систем.",
    icon: Cpu, // Add an icon here
  },
  {
    id: "video-surveillance",
    title: "Видеонаблюдение",
    description: "Камеры высокого разрешения с удалённым доступом.",
    icon: Video, // Add an icon here
  },
  {
    id: "installation",
    title: "Монтажные работы",
    description: "Установка систем от проекта до запуска.",
    icon: Wrench, // Add an icon here
  },
  {
    id: "design",
    title: "Проектирование технических проектов",
    description:
      "Разработка комплексных решений для безопасности и автоматизации.",
    icon: ClipboardList, // Add an icon here
    subcategories: [
      "Проектирование систем сигнализации",
      "Проектирование видеонаблюдения",
      "Проектирование автоматизированных систем",
    ],
  },
];

const cardVariants: any = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export function Services() {
  return (
    <section className="py-20 lg:py-28 px-4 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm font-medium"
          >
            <Shield className="w-4 h-4" />
            <span>Наши услуги</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Что мы предлагаем
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Комплексные решения для безопасности, автоматизации и инженерных систем
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Card className="flex flex-col h-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {service.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow pt-0">
                    <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed flex-grow mb-4">
                      {service.description}
                    </p>
                    {service.subcategories && (
                      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                          Направления:
                        </h4>
                        <ul className="space-y-2">
                          {service.subcategories.map((sub, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {sub}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Hover indicator */}
                    <motion.div
                      className="mt-4 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-full transition-all duration-300"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
