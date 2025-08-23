"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { PartnersCarousel } from "@/components/PartnersCarousel";
import { ProductSections } from "@/components/ProductSections";
import { PromoCard } from "@/components/PromoCard";
import { Services } from "@/components/Services";
import { SectionWrapper } from "@/components/SectionWrapper";

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <div className={isMounted ? "animate-fade-in" : ""}>
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
      </div>
    </>
  );
}
