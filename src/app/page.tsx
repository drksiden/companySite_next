'use client'; // Очень важно, чтобы это был клиентский компонент

import { motion } from 'framer-motion';
import Head from 'next/head';
import { Hero } from '@/components/Hero';
import { PartnersCarousel } from '@/components/PartnersCarousel';
import { TekoSection, FlexemSection, AntSection } from '@/components/ProductSections';
import { PromoCard } from '@/components/PromoCard';
import { Services } from '@/components/Services';
import { SectionWrapper } from '@/components/SectionWrapper';

export default function HomePage() {
  const COMPANY_NAME_SHORT = 'Your Company'; // Замените на ваше значение

  return (
    <>
      <Head>
        <title>{COMPANY_NAME_SHORT}</title>
        <meta
          name="description"
          content="Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры."
        />
        <link rel="canonical" href="https://ваш-домен.kz/" />
        <meta property="og:title" content="Системная интеграция и безопасность в Казахстане" />
        <meta
          property="og:description"
          content="Комплексные решения по безопасности, автоматизации и сетевому оборудованию. Официальные дилеры ведущих производителей."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ваш-домен.kz/" />
        <meta property="og:image" content="https://ваш-домен.kz/images/og-image.jpg" />
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Hero />
        <SectionWrapper className="w-full">
          <PartnersCarousel />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <TekoSection />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <FlexemSection />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <AntSection />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <PromoCard />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Services />
        </SectionWrapper>
      </motion.div>
    </>
  );
}
