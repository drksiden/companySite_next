"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RefreshCw, Home } from "@/components/icons/SimpleIcons";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Логируем критическую ошибку
    import('@/lib/logger/client').then(({ clientLogger }) => {
      clientLogger.error('Global error occurred', error, {
        errorType: 'global-error',
        digest: error.digest,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
      });
    });
    
    // Добавляем мета-тег noindex для предотвращения индексации страниц ошибок
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50/30 to-yellow-50/40 dark:from-red-900/20 dark:via-orange-900/10 dark:to-yellow-900/5 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/4 w-40 h-40 bg-destructive/10 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"
              animate={{
                x: [0, -20, 0],
                y: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>

          <div className="max-w-2xl w-full text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Error Icon */}
              <motion.div
                className="text-7xl mb-8"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              >
                💥
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <Card className="border border-destructive/20 shadow-xl bg-background/90 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4 text-destructive">
                      Критическая ошибка
                    </h1>
                    <p className="text-muted-foreground text-lg mb-6 max-w-lg mx-auto leading-relaxed">
                      Произошла серьезная ошибка в работе приложения. Мы уже
                      получили уведомление и работаем над исправлением.
                    </p>

                    {/* Error Details for Development */}
                    {process.env.NODE_ENV === "development" && (
                      <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
                        <p className="text-sm font-mono text-destructive break-all">
                          {error.message}
                        </p>
                        {error.digest && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Error ID: {error.digest}
                          </p>
                        )}
                        {error.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Stack trace
                            </summary>
                            <pre className="text-xs text-muted-foreground mt-2 overflow-auto max-h-32">
                              {error.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <Button
                        onClick={reset}
                        size="lg"
                        className="min-w-[160px] shadow-md hover:shadow-lg transition-shadow"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Попробовать снова
                      </Button>

                      <Button
                        variant="outline"
                        asChild
                        size="lg"
                        className="min-w-[160px] border-primary/20 hover:bg-primary/5"
                      >
                        <Link href="/">
                          <Home className="h-4 w-4 mr-2" />
                          Перезагрузить сайт
                        </Link>
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Help Text */}
              <motion.div
                className="mt-8 text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <p>
                  Если проблема повторяется, пожалуйста,{" "}
                  <a
                    href="/contact"
                    className="text-primary hover:underline transition-colors"
                  >
                    свяжитесь с нами
                  </a>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </body>
    </html>
  );
}
