"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COMPANY_NAME } from "@/data/constants";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  CheckCircle,
  Award,
  UserPlus,
  ShieldCheck,
  Zap,
  Lightbulb,
  Phone,
} from "lucide-react";

// Данные для ключевых достижений
const achievements = [
  {
    value: "18+",
    label: "Лет на рынке",
    icon: <Award className="text-primary h-8 w-8" />,
  },
  {
    value: "250+",
    label: "Выполненных проектов",
    icon: <CheckCircle className="text-primary h-8 w-8" />,
  },
  {
    value: "100%",
    label: "Довольных клиентов",
    icon: <UserPlus className="text-primary h-8 w-8" />,
  },
];

// Данные для услуг с иконками
const services = [
  {
    title: "Пожарная безопасность",
    description: "Комплексные решения для предотвращения и борьбы с пожарами.",
    icon: <Zap className="h-6 w-6 text-primary" />,
  },
  {
    title: "Охранные системы",
    description: "Современные системы обнаружения вторжения и сигнализации.",
    icon: <ShieldCheck className="h-6 w-6 text-primary" />,
  },
  {
    title: "Системы автоматизации",
    description: "Интеграция передовых технологий для оптимизации процессов.",
    icon: <Lightbulb className="h-6 w-6 text-primary" />,
  },
  {
    title: "Проектирование и монтаж",
    description: "Полный цикл работ от разработки до установки систем.",
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
  },
];

// Анимационные варианты для элементов
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
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
};

const AboutUs: React.FC = () => {
  const router = useRouter();

  return (
    <section
      id="about"
      className="py-16 lg:py-20 px-4 bg-background w-full overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-foreground mb-10 md:mb-16 text-center"
        >
          О Компании {COMPANY_NAME}
        </motion.h2>

        {/* Секция с изображением и основным текстом */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md mx-auto md:max-w-none"
          >
            <Image
              src="/images/about/company_image.jpg"
              alt={`Офис ${COMPANY_NAME}`}
              width={1024}
              height={678}
              className="rounded-xl shadow-xl w-full h-auto object-cover aspect-[4/3]"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <Card className="flex flex-col border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground mb-4">
                  Ваш эксперт в безопасности с 2005 года
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  ТОО &ldquo;{COMPANY_NAME}&rdquo; является ведущим поставщиком
                  и интегратором современных систем безопасности и автоматизации
                  в Казахстане. Мы специализируемся на комплексных решениях для
                  объектов любой сложности.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Наша миссия — обеспечить вашу безопасность, спокойствие и
                  комфорт, используя передовые технологии и многолетний опыт
                  наших специалистов.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Separator className="bg-border my-16" />

        {/* Секция с услугами */}
        <div className="mb-16 lg:mb-24 text-center">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-foreground mb-10"
          >
            Наши услуги
          </motion.h3>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="p-6 transition-transform transform hover:scale-105 hover:shadow-xl">
                  <div className="flex items-center space-x-4 mb-4">
                    {service.icon}
                    <CardTitle className="text-lg font-semibold">
                      {service.title}
                    </CardTitle>
                  </div>
                  <CardContent className="p-0">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary/90 to-primary border border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Готовы обсудить ваш проект?
                </h3>
                <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                  Получите бесплатную консультацию и коммерческое предложение
                  уже сегодня
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    onClick={() => router.push("/contacts")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-background text-foreground px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border border-border/20"
                  >
                    <Phone className="w-5 h-5" />
                    Связаться с нами
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
