'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { RegionProvider } from "@/providers/region";
import { CartProvider } from "@/providers/cart"; // Ваш CartProvider
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Toaster } from "@/components/ui/sonner";
import { Car } from 'lucide-react';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RegionProvider>
        <CartProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
            <ScrollToTopButton />
            <Toaster richColors />
          </ThemeProvider>
        </CartProvider>
      </RegionProvider>
    </SessionProvider>
  );
}