import { HomeClient } from "./HomeClient";
import { Suspense } from "react";
import { News } from "@/components/News";
import { NewsLoadingFallback } from "@/components/NewsLoadingFallback";
import { Metadata } from "next";
import { COMPANY_NAME, COMPANY_NAME_SHORT } from "@/data/constants";

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  title: {
    default: COMPANY_NAME,
    template: `%s | ${COMPANY_NAME_SHORT}`,
  },
  description: 'Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры ведущих производителей.',
  keywords: [
    'системная интеграция',
    'безопасность',
    'автоматизация',
    'СКС',
    'СКУД',
    'СОУЭ',
    'видеонаблюдение',
    'пожарная сигнализация',
    'охранная сигнализация',
    'Казахстан',
    'Алматы',
    COMPANY_NAME_SHORT,
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `Системная интеграция и безопасность в Казахстане - ${COMPANY_NAME}`,
    description: 'Комплексные решения по безопасности, автоматизации и сетевому оборудованию. Официальные дилеры ведущих производителей.',
    url: '/',
    siteName: COMPANY_NAME_SHORT,
    images: [
      {
        url: `${siteBaseUrl}/images/logos/asia-ntb/Asia-NTB-logo-rus-dark.svg`,
        width: 1200,
        height: 630,
        alt: COMPANY_NAME,
      },
    ],
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Системная интеграция и безопасность - ${COMPANY_NAME_SHORT}`,
    description: 'Комплексные решения по безопасности, автоматизации и сетевому оборудованию.',
  },
};

export default function ServerHomePage() {
  return (
    <HomeClient
      newsSlot={
        <Suspense fallback={<NewsLoadingFallback />}>
          <News />
        </Suspense>
      }
    />
  );
}