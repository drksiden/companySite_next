'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '@/components/Hero';
import { PartnersCarousel } from '@/components/PartnersCarousel';
import { TekoSection, FlexemSection, AntSection } from '@/components/ProductSections';
import { PromoCard } from '@/components/PromoCard';
import { Services } from '@/components/Services';
import { SectionWrapper } from '@/components/SectionWrapper';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background" suppressHydrationWarning>
        <div className="animate-pulse">
          <div className="h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"></div>
          <div className="space-y-16 py-16">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted mx-4 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
  );
}