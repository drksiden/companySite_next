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
  ShieldCheck,
  Zap,
  Lightbulb,
  Phone,
} from "lucide-react";


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
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const
    } 
  },
};


const AboutUs: React.FC = () => {
  const router = useRouter();

  return (
    <section
      id="about"
      className="relative py-16 lg:py-20 px-4 bg-gradient-to-b from-background via-muted/20 to-background w-full overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Заголовок страницы */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            О Компании {COMPANY_NAME}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
        </motion.div>

        {/* Секция с изображением и основным текстом */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md mx-auto md:max-w-none relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            <Image
              src="/images/about/company_image.jpg"
              alt={`Офис ${COMPANY_NAME}`}
              width={1024}
              height={678}
              className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="text-left"
          >
            <Card className="flex flex-col border-2 border-blue-100/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ваш эксперт в безопасности с 2005 года
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed text-base">
                  ТОО &ldquo;{COMPANY_NAME}&rdquo; является ведущим поставщиком
                  и интегратором современных систем безопасности и автоматизации
                  в Казахстане. Мы специализируемся на комплексных решениях для
                  объектов любой сложности.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed text-base">
                  Наша миссия — обеспечить вашу безопасность, спокойствие и
                  комфорт, используя передовые технологии и многолетний опыт
                  наших специалистов.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>


        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent my-16" />

        {/* Секция с услугами */}
        <div className="mb-16 lg:mb-24 text-center">
          <motion.h3
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
          >
            Наши услуги
          </motion.h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-10"
          />
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="p-6 h-full transition-all duration-300 bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-900/90 dark:to-gray-800/70 border-2 border-blue-100/50 dark:border-blue-800/50 shadow-lg hover:shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center justify-center mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"
                    >
                      {service.icon}
                    </motion.div>
                    <CardTitle className="text-lg font-bold mb-3 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardContent className="p-0">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {service.description}
                      </p>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 pb-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center border-2 border-blue-200/50 dark:border-blue-800/50 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Animated background gradient */}
              <motion.div
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear',
                }}
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
                  backgroundSize: '200% 200%',
                }}
              />
              
              {/* Floating orbs */}
              <motion.div
                animate={{
                  x: [0, 30, 0],
                  y: [0, -20, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  x: [0, -30, 0],
                  y: [0, 20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
                className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
              />

              <div className="relative z-10">
                <motion.h3
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                >
                  Готовы обсудить ваш проект?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
                >
                  Получите бесплатную консультацию и коммерческое предложение
                  уже сегодня
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <motion.button
                    onClick={() => router.push("/contacts")}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 100%)',
                      color: 'white',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <Phone className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Связаться с нами</span>
                    <motion.span
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
