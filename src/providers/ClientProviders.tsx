// src/providers/ClientProviders.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from "@/providers/cart";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap'
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={inter.variable} suppressHydrationWarning>
      <SessionProvider>
        <CartProvider>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <div className={`min-h-screen bg-background font-sans antialiased ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <ScrollToTopButton />
              <Toaster richColors />
            </div>
          </ThemeProvider>
        </CartProvider>
      </SessionProvider>
    </div>
  );
}