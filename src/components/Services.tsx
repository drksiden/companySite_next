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
    <section className="py-16 lg:py-20 px-4 bg-gray-50 dark:bg-gray-900 w-full">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 md:mb-12 text-center"
        >
          Наши Услуги
        </motion.h2>
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
              >
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-center">
                      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-4 shrink-0" />
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-grow mb-4">
                      {service.description}
                    </p>
                    {service.subcategories && (
                      <div className="mt-auto border-t pt-3">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                          Направления:
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                          {service.subcategories.map((sub, idx) => (
                            <li key={idx}>• {sub}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
