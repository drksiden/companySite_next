'use client';
 
import { ThemeProvider } from 'next-themes';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { Toaster } from "@/components/ui/sonner";
import { usePathname } from 'next/navigation';
import { Analytics } from '@/components/analytics/Analytics';
import { AnalyticsStopper } from '@/components/analytics/AnalyticsStopper';
import { useEffect, useState } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register-sw';
import { SkipLinks } from '@/components/accessibility/SkipLinks';
 
export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Определяем isAdminRoute - проверяем сразу, без ожидания монтирования
  // Это важно для предотвращения загрузки аналитики на админ-роутах
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Загружаем Web Vitals только на клиенте и не на админке
  useEffect(() => {
    if (isAdminRoute || typeof window === 'undefined') return;

    // Динамически импортируем Web Vitals только на клиенте
    Promise.all([
      import('web-vitals'),
      import('@/lib/analytics/web-vitals')
    ]).then(([webVitals, { reportWebVitals }]) => {
      if (webVitals.onCLS) webVitals.onCLS(reportWebVitals);
      if (webVitals.onFCP) webVitals.onFCP(reportWebVitals);
      if (webVitals.onLCP) webVitals.onLCP(reportWebVitals);
      if (webVitals.onTTFB) webVitals.onTTFB(reportWebVitals);
      if (webVitals.onINP) webVitals.onINP(reportWebVitals);
    }).catch((error) => {
      // Web Vitals не критичен, просто игнорируем ошибку
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to load Web Vitals:', error);
      }
    });
  }, [isAdminRoute]);

  // Регистрация Service Worker для PWA
  useEffect(() => {
    if (!isAdminRoute && typeof window !== 'undefined') {
      registerServiceWorker();
    }
  }, [isAdminRoute]);
 
  // Всегда рендерим main с одинаковыми атрибутами для избежания гидратации
  // Рендерим Header и Footer всегда, но с suppressHydrationWarning для избежания ошибок
  // suppressHydrationWarning на main необходим, так как ThemeProvider может влиять на рендеринг
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {mounted && !isAdminRoute && <SkipLinks />}
      {!isAdminRoute && <Header />}
      <main id="main-content" className="flex-grow" tabIndex={-1} suppressHydrationWarning>
        {children}
      </main>
      {!isAdminRoute && <Footer />}
      {mounted && <ScrollToTopButton />}
      <Toaster richColors />
      {!isAdminRoute && <Analytics />}
      {/* Останавливаем аналитику на админ-роутах, даже если она уже была загружена */}
      {isAdminRoute && <AnalyticsStopper />}
    </ThemeProvider>
  );
}
