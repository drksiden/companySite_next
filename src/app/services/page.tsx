"use client";

import { FC } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";
import ServiceAccordionList from "@/components/ServiceAccordionList";
import { ALEXEY_PHONE, COMPANY_CITY_PHONE1 } from "@/data/constants";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative pt-20 flex items-center justify-center px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Наши услуги
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8" />

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
            Комплексные решения в области систем безопасности, автоматизации и
            инженерных коммуникаций для объектов любой сложности
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              От проектирования до технического обслуживания — мы обеспечиваем
              комплексные решения для вашей безопасности и автоматизации
            </p>
          </motion.div>
        </div>
        <div className="min-h-screen">
          <ServiceAccordionList />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 pb-15">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary/90 to-primary border border-border/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute top-0  right-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Готовы обсудить ваш проект?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
                Получите бесплатную консультацию и коммерческое предложение уже
                сегодня
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.button
                  onClick={handleContactsPage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-background text-foreground px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border border-border/20"
                >
                  Связаться с нами
                </motion.button>

                {/*<motion.button
                  onClick={handleWhatsApp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </motion.button>*/}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
