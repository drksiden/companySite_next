"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Users,
  Settings,
  CheckCircle,
  Phone,
  Calendar,
  ArrowRight,
} from "lucide-react";

export function ServicesProcess() {
  const processSteps = [
    {
      id: 1,
      icon: Phone,
      title: "Консультация",
      description: "Обсуждаем ваши потребности и техническое задание",
      details: ["Выезд специалиста", "Анализ объекта", "Составление ТЗ"],
      duration: "1-2 дня",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      icon: FileText,
      title: "Проектирование",
      description: "Разрабатываем техническое решение и проектную документацию",
      details: ["Выбор оборудования", "Схемы подключения", "Смета"],
      duration: "3-7 дней",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: 3,
      icon: Calendar,
      title: "Согласование",
      description: "Утверждаем проект и планируем сроки выполнения работ",
      details: ["Презентация проекта", "Корректировки", "Подписание договора"],
      duration: "1-3 дня",
      color: "from-orange-500 to-red-500",
    },
    {
      id: 4,
      icon: Settings,
      title: "Монтаж",
      description: "Выполняем монтажные работы и настройку оборудования",
      details: ["Установка оборудования", "Прокладка кабелей", "Настройка"],
      duration: "от 1 недели",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: 5,
      icon: Users,
      title: "Обучение",
      description: "Обучаем персонал работе с установленными системами",
      details: ["Инструктаж", "Практическое обучение", "Документация"],
      duration: "1 день",
      color: "from-indigo-500 to-purple-500",
    },
    {
      id: 6,
      icon: CheckCircle,
      title: "Сдача объекта",
      description: "Тестируем систему и передаем заказчику готовый объект",
      details: [
        "Тестирование",
        "Акт приема-передачи",
        "Гарантийные обязательства",
      ],
      duration: "1 день",
      color: "from-teal-500 to-green-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const lineVariants = {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1.5,
        ease: "easeInOut" as const,
        delay: 0.3,
      },
    },
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Как мы работаем
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6" />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Наш проверенный процесс гарантирует качественное выполнение проекта
            от идеи до полной реализации
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <motion.div
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="absolute left-4 md:left-1/2 top-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 origin-top"
            style={{ height: `${(processSteps.length - 1) * 200 + 100}px` }}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-16"
          >
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  className={`relative flex items-center ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  } flex-col md:gap-16`}
                >
                  {/* Content Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`flex-1 ${isEven ? "md:text-right" : "md:text-left"} text-center md:ml-0 ml-12`}
                  >
                    <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                      {/* Gradient overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}
                      />

                      <div className="relative z-10">
                        {/* Step number and duration */}
                        <div
                          className={`flex items-center justify-between mb-4 ${
                            isEven ? "md:flex-row-reverse" : ""
                          } flex-row`}
                        >
                          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                            Этап {step.id}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {step.duration}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-foreground mb-3">
                          {step.title}
                        </h3>

                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Details list */}
                        <ul
                          className={`space-y-2 text-sm text-muted-foreground ${
                            isEven ? "md:text-right" : "md:text-left"
                          } text-center`}
                        >
                          {step.details.map((detail, idx) => (
                            <li
                              key={idx}
                              className={`flex items-center ${
                                isEven ? "md:flex-row-reverse" : ""
                              } justify-center md:justify-start`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-2 flex-shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  {/* Central Icon */}
                  <motion.div
                    className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 z-20"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg border-4 border-background`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>

                  {/* Arrow for non-mobile */}
                  {index < processSteps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute left-1/2 transform -translate-x-1/2 mt-32"
                      animate={{ y: [0, 5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                      </div>
                    </motion.div>
                  )}

                  {/* Spacer for mobile */}
                  <div className="flex-1 md:block hidden" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Готовы начать проект?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Свяжитесь с нами для бесплатной консультации и получения
              коммерческого предложения
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 inline-flex items-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Получить консультацию
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
