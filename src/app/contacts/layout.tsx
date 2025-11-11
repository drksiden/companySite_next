import { Metadata } from 'next';
import { COMPANY_NAME, COMPANY_NAME_SHORT, COMPANY_ADDRESS } from "@/data/constants";

const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  title: 'Контакты',
  description: `Свяжитесь с ${COMPANY_NAME}. Адрес: ${COMPANY_ADDRESS}. Телефоны, email и карта проезда. Мы всегда готовы ответить на ваши вопросы.`,
  keywords: [
    'контакты',
    'адрес',
    'телефон',
    'email',
    'Алматы',
    'Казахстан',
    COMPANY_NAME_SHORT,
  ],
  alternates: {
    canonical: '/contacts',
  },
  openGraph: {
    title: `Контакты - ${COMPANY_NAME_SHORT}`,
    description: `Свяжитесь с нами. Адрес: ${COMPANY_ADDRESS}. Телефоны, email и карта проезда.`,
    url: '/contacts',
    siteName: COMPANY_NAME_SHORT,
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary',
    title: `Контакты - ${COMPANY_NAME_SHORT}`,
    description: `Свяжитесь с ${COMPANY_NAME}. Адрес, телефоны, email.`,
  },
};

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

