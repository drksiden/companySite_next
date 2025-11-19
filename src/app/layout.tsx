import './globals.css';
import type { Metadata } from 'next';
import { COMPANY_NAME, COMPANY_NAME_SHORT } from '@/data/constants';
import { ClientProviders } from './ClientProviders';
import { cn } from '@/lib/utils';
import { inter } from '@/styles/fonts';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';

// Рекомендуется определить базовый URL сайта, например, из переменных окружения
const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: COMPANY_NAME, // Заголовок по умолчанию
    template: `%s | ${COMPANY_NAME_SHORT}`, // Шаблон для заголовков страниц
  },
  description: 'Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры.',
  keywords: [
    'системная интеграция',
    'безопасность',
    'автоматизация',
    'Казахстан',
    'Алматы',
    'системы безопасности',
    'видеонаблюдение',
    'контроль доступа',
    'пожарная сигнализация',
    'сетевое оборудование',
    'ТЕКО',
    'Азия NTB',
  ],
  authors: [{ name: COMPANY_NAME }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    countryName: 'Kazakhstan',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Системная интеграция и безопасность - ${COMPANY_NAME_SHORT}`,
    description: 'Комплексные решения по безопасности, автоматизации и сетевому оборудованию.',
  },
  verification: {
    // Добавьте коды верификации для поисковых систем при необходимости
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon0.svg', type: 'image/svg+xml' },
      { url: '/icon1.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-icon.png',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="apple-mobile-web-app-title" content="Азия NTB" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        {/* Favicon links for better SEO and browser compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon0.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <OrganizationJsonLd />
        {/* RSS Feed */}
        <link rel="alternate" type="application/rss+xml" title={`${COMPANY_NAME_SHORT} - Новости`} href="/news/rss.xml" />
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://r2.asia-ntb.kz" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://r2.asia-ntb.kz" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prefetch important pages */}
        <link rel="prefetch" href="/catalog" as="document" />
        <link rel="prefetch" href="/services" as="document" />
        <link rel="prefetch" href="/about" as="document" />
        <link rel="prefetch" href="/contacts" as="document" />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <ReactQueryClientProvider>
          <ClientProviders>
          {children}
        </ClientProviders>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
