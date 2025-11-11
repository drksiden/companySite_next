import './globals.css';
import type { Metadata } from 'next';
import { COMPANY_NAME, COMPANY_NAME_SHORT } from '@/data/constants';
import { ClientProviders } from './ClientProviders';
import { cn } from '@/lib/utils';
import { inter } from '@/styles/fonts';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';

// Рекомендуется определить базовый URL сайта, например, из переменных окружения
const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: COMPANY_NAME, // Заголовок по умолчанию
    template: `%s | ${COMPANY_NAME_SHORT}`, // Шаблон для заголовков страниц
  },
  description: 'Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры.', // Более подробное описание из head.tsx
  alternates: {
    canonical: '/', // Канонический URL для главной страницы
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Азия NTB" />
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
