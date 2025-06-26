'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from "@/providers/cart";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from 'react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

   // Избегаем гидратации на стороне сервера
   useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Показываем fallback до монтирования на клиенте
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }

  return (
    <SessionProvider>
      <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <ScrollToTopButton />
            <Toaster richColors />
          </ThemeProvider>
        </CartProvider>
    </SessionProvider>
  );
}