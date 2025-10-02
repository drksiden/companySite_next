"use client";

import { Hero } from "@/components/Hero";
import { PartnersCarousel } from "@/components/PartnersCarousel";
import { ProductSection } from "@/components/ProductSection";
import { PromoCard } from "@/components/PromoCard";
import { Services } from "@/components/Services";
import { SectionWrapper } from "@/components/SectionWrapper";

interface HomeClientProps {
  newsSlot: React.ReactNode;
}

export function HomeClient({ newsSlot }: HomeClientProps) {
  return (
    <>
      <div className="opacity-0 animate-fade-in">
        <Hero />
        <SectionWrapper className="w-full">
          <PartnersCarousel />
        </SectionWrapper>
        
        <SectionWrapper className="w-full">
          {newsSlot}
        </SectionWrapper>
        
        <SectionWrapper className="w-full">
          <ProductSection sectionType="teko" />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <ProductSection sectionType="flexem" />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <ProductSection sectionType="ant" />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <PromoCard />
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Services />
        </SectionWrapper>
      </div>
    </>
  );
}