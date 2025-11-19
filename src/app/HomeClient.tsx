"use client";

import { Hero } from "@/components/Hero";
import { News } from "@/components/News"; 
import { SectionWrapper } from "@/components/SectionWrapper";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Динамические импорты для тяжелых компонентов
const PartnersCarousel = dynamic(
  () => import("@/components/PartnersCarousel").then((mod) => ({ default: mod.PartnersCarousel })),
  {
    loading: () => (
      <div className="w-full py-8">
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: true,
  }
);

const ProductSection = dynamic(
  () => import("@/components/ProductSection").then((mod) => ({ default: mod.ProductSection })),
  {
    loading: () => (
      <div className="w-full py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: true,
  }
);

const PromoCard = dynamic(
  () => import("@/components/PromoCard").then((mod) => ({ default: mod.PromoCard })),
  {
    loading: () => (
      <div className="w-full py-8">
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: true,
  }
);

const Services = dynamic(
  () => import("@/components/Services").then((mod) => ({ default: mod.Services })),
  {
    loading: () => (
      <div className="w-full py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    ),
    ssr: true,
  }
);

interface HomeClientProps {
  newsSlot: React.ReactNode;
}

export function HomeClient({ newsSlot }: HomeClientProps) {
  return (
    <>
      <div className="opacity-0 animate-fade-in">
        <Hero />
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <PartnersCarousel />
          </Suspense>
        </SectionWrapper>
        
        <SectionWrapper className="w-full">
          {newsSlot}
        </SectionWrapper>
        
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProductSection sectionType="teko" />
          </Suspense>
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProductSection sectionType="flexem" />
          </Suspense>
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProductSection sectionType="ant" />
          </Suspense>
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <PromoCard />
          </Suspense>
        </SectionWrapper>
        <SectionWrapper className="w-full">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <Services />
          </Suspense>
        </SectionWrapper>
      </div>
    </>
  );
}