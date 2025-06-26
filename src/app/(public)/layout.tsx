import { ReactNode } from 'react'
import { ClientProviders } from '@/providers/ClientProviders'
import { inter } from '@/styles/fonts';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
