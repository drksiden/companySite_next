import './globals.css';
import type { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { ClientProviders } from './ClientProviders';
import { RegionProvider } from '@/providers/region';
import { ThemeProvider } from '@/providers/theme';
import { cn } from '@/lib/utils';
import { fontSans } from '@/styles/fonts';

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
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RegionProvider>
            <ClientProviders>
              {children}
            </ClientProviders>
          </RegionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
