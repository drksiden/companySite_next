import './globals.css';
import type { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { ClientProviders } from './ClientProviders';
import { cn } from '@/lib/utils';
import { inter } from '@/styles/fonts';
import { ReactQueryClientProvider } from '@/components/ReactQueryClientProvider';

// Рекомендуется определить базовый URL сайта, например, из переменных окружения
const siteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://asia-ntb.kz';

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: {
    default: COMPANY_NAME_SHORT, // Заголовок по умолчанию
    template: `%s | ${COMPANY_NAME_SHORT}`, // Шаблон для заголовков страниц
  },
  description: 'Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане. Комплексные решения, монтаж, обслуживание, официальные дилеры.', // Более подробное описание из head.tsx
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/images/logos/asia-ntb/Asia-NTB-logo-eng-dark.svg', type: 'image/svg+xml', sizes: 'any' }, // 'any' или конкретные размеры '32x32'
    // Рассмотрите, нужен ли Asia-NTB-logo-eng-light.svg из head.tsx и для каких целей
    // { rel: 'icon', url: '/images/logos/asia-ntb/Asia-NTB-logo-eng-light.svg', type: 'image/svg+xml', sizes: 'any' },
  ],
  alternates: {
    canonical: '/', // Канонический URL для главной страницы
  },
  openGraph: {
    title: `Системная интеграция и безопасность в Казахстане - ${COMPANY_NAME_SHORT}`, // Обновленный OG заголовок
    description: 'Комплексные решения по безопасности, автоматизации и сетевому оборудованию. Официальные дилеры ведущих производителей.',
    url: '/', // OG URL для главной страницы
    siteName: COMPANY_NAME_SHORT,
    // images: [
    //   {
    //     url: '/images/logos/asia-ntb/Asia-NTB-logo-rus-dark.svg', // Убедитесь, что этот файл существует и доступен
    //     width: 1200, // Рекомендуемые размеры
    //     height: 630,
    //   },
    // ],
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
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
