"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import ServiceAccordionList from "@/components/ServiceAccordionList";
import { ALEXEY_PHONE, COMPANY_CITY_PHONE1 } from "@/data/constants";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const ServicesPage: FC = () => {
  const router = useRouter();
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

  const cardVariants = {
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

  const handleWhatsApp = () => {
    // Форматируем номер для WhatsApp (убираем пробелы и скобки)
    const phoneNumber = ALEXEY_PHONE.replace(/\D/g, "");
    const message = encodeURIComponent(
      "Здравствуйте! Интересует консультация по вашим услугам.",
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  const handleContactsPage = () => {
    router.push("/contacts");
  };

  const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';
  const breadcrumbItems = [
    { name: 'Главная', url: '/' },
    { name: 'Услуги', url: '/services' },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Главная
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Услуги</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 flex items-center justify-center px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-6xl mx-auto text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
          >
            Наши услуги
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mb-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Комплексные решения в области систем безопасности, автоматизации и
            инженерных коммуникаций для объектов любой сложности
          </motion.p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="px-4 relative py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              От проектирования до технического обслуживания — мы обеспечиваем
              комплексные решения для вашей безопасности и автоматизации
            </p>
          </motion.div>
        </div>
        <div className="min-h-screen pb-16">
          <ServiceAccordionList />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-16">
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
                Получите бесплатную консультацию и коммерческое предложение уже
                сегодня
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  onClick={handleContactsPage}
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
      </section>
    </div>
    </>
  );
};

export default ServicesPage;
