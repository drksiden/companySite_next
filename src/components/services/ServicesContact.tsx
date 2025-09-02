"use client";

import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export function ServicesContact() {
  const contactInfo = [
    {
      icon: Phone,
      title: "Телефон",
      value: "+7 (700) 123-45-67",
      description: "Звонки принимаем ежедневно",
    },
    {
      icon: Mail,
      title: "Email",
      value: "info@asianewtech.kz",
      description: "Ответим в течение часа",
    },
    {
      icon: MapPin,
      title: "Адрес",
      value: "г. Алматы, ул. Абая 123",
      description: "Приезжайте в наш офис",
    },
    {
      icon: Clock,
      title: "Режим работы",
      value: "Пн-Пт: 9:00 - 18:00",
      description: "Сб: 10:00 - 15:00",
    },
  ];

  const benefits = [
    "Бесплатная консультация и выезд специалиста",
    "Гарантия на все виды работ до 3 лет",
    "Сертифицированные специалисты",
    "Работаем с юридическими и физическими лицами",
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-background" />

      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Content */}
          <div>
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Начнем ваш проект
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6" />
              <p className="text-xl text-muted-foreground leading-relaxed">
                Свяжитесь с нами любым удобным способом. Наши специалисты
                проконсультируют вас по всем вопросам и подготовят
                индивидуальное предложение.
              </p>
            </motion.div>

            {/* Benefits */}
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                Почему выбирают нас:
              </h3>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="bg-green-500 rounded-full p-1 mt-1 flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-muted-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Позвонить сейчас
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-border bg-background/80 backdrop-blur-sm text-foreground px-8 py-4 rounded-2xl font-semibold hover:shadow-lg transition-shadow duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Написать в WhatsApp
              </motion.button>
            </motion.div>
          </div>

          {/* Right - Contact Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {contactInfo.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {contact.title}
                  </h3>

                  <p className="text-foreground font-medium mb-1">
                    {contact.value}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {contact.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Готовы обсудить ваш проект?
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Получите бесплатную консультацию и коммерческое предложение уже
              сегодня
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2"
              >
                Оставить заявку
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <p className="text-white/80 text-sm">
                или позвоните по телефону{" "}
                <span className="font-semibold text-white">
                  +7 (700) 123-45-67
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
