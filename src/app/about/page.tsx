import type { Metadata } from 'next';
import AboutUs from './AboutUs';
import { COMPANY_NAME, COMPANY_NAME_SHORT } from '@/data/constants';

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  title: 'О компании',
  description: `${COMPANY_NAME} - ведущий системный интегратор в Казахстане. Специализируемся на комплексных решениях в области безопасности, автоматизации и сетевого оборудования. Официальные дилеры ведущих производителей.`,
  keywords: [
    'о компании',
    'системный интегратор',
    'безопасность',
    'автоматизация',
    'Казахстан',
    'Алматы',
    COMPANY_NAME_SHORT,
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: `О компании - ${COMPANY_NAME_SHORT}`,
    description: `${COMPANY_NAME} - ведущий системный интегратор в Казахстане. Комплексные решения в области безопасности и автоматизации.`,
    url: '/about',
    siteName: COMPANY_NAME_SHORT,
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: `О компании - ${COMPANY_NAME_SHORT}`,
    description: `${COMPANY_NAME} - ведущий системный интегратор в Казахстане.`,
  },
};

export default function AboutPage() {
  return <AboutUs />;
}