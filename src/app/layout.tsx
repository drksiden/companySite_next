import './globals.css';
import type { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { ClientProviders } from './ClientProviders';

export const metadata: Metadata = {
  title: COMPANY_NAME_SHORT,
  description: 'Ваш надежный системный интегратор в области безопасности и автоматизации в Казахстане.',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/images/logos/asia-ntb/Asia-NTB-logo-eng-dark.svg', type: 'image/svg+xml', sizes: '32x32' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
