'use client'; // Очень важно, чтобы это был клиентский компонент

import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { PartnersCarousel } from '@/components/PartnersCarousel';
import { ProductSections } from '@/components/ProductSections';
import { PromoCard } from '@/components/PromoCard';
import { Services } from '@/components/Services';
import { SectionWrapper } from '@/components/SectionWrapper';

export default function HomePage() {

  return (
    <>
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
          <ProductSections sectionType="teko" />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <ProductSections sectionType="flexem" />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <ProductSections sectionType="ant" />
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
