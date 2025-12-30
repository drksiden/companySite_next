"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  Award,
  Clock,
  Shield,
  Wrench,
  Users,
  CheckCircle2,
} from "lucide-react";

const advantages = [
  {
    id: 1,
    icon: Award,
    title: "Официальные дилеры",
    description:
      "Работаем напрямую с производителями, гарантируя оригинальность и качество оборудования",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    icon: Clock,
    title: "Быстрые сроки",
    description:
      "Оптимизированные процессы позволяют выполнять проекты в кратчайшие сроки без потери качества",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: 3,
    icon: Shield,
    title: "Гарантия качества",
    description:
      "Предоставляем гарантию на все виды работ и оборудование, обеспечивая надежность решений",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: 4,
    icon: Wrench,
    title: "Профессиональный монтаж",
    description:
      "Команда опытных специалистов с многолетним опытом установки и настройки систем",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 5,
    icon: Users,
    title: "Индивидуальный подход",
    description:
      "Разрабатываем решения с учетом специфики вашего объекта и требований безопасности",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: 6,
    icon: CheckCircle2,
    title: "Полный цикл работ",
    description:
      "От проектирования до обслуживания — комплексный подход к реализации проектов",
    color: "from-teal-500 to-cyan-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function WhyUs() {
  return (
    <section className="py-20 lg:py-28 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
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
            <Award className="w-4 h-4" />
            <span>Наши преимущества</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Почему выбирают нас
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Мы предлагаем не просто оборудование, а комплексные решения с
            полной поддержкой на всех этапах реализации проекта
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {advantages.map((advantage) => {
            const Icon = advantage.icon;
            return (
              <motion.div
                key={advantage.id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group"
              >
                <Card className="h-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 shadow-lg hover:shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    {/* Icon */}
                    <motion.div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${advantage.color} text-white mb-6 shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-8 h-8" />
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {advantage.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {advantage.description}
                    </p>

                    {/* Hover indicator */}
                    <motion.div
                      className="mt-4 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-full transition-all duration-300"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Готовы начать проект? Свяжитесь с нами для бесплатной консультации
          </p>
          <motion.a
            href="/contacts"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Связаться с нами
            <CheckCircle2 className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

