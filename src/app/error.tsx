"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { RefreshCw, Home, ArrowLeft } from "@/components/icons/SimpleIcons";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Логируем ошибку
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="border-dashed border-2 border-destructive/20">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-4 text-destructive">
                  Произошла ошибка
                </h1>
                <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
                  Что-то пошло не так. Мы уже работаем над исправлением проблемы.
                </p>

                {/* Error Details for Development */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                    <p className="text-sm font-mono text-destructive">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ID ошибки: {error.digest}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={reset} size="lg" className="min-w-[140px]">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Повторить
                  </Button>

                  <Button variant="outline" asChild size="lg" className="min-w-[140px]">
                    <Link href="/">
                      <Home className="h-4 w-4 mr-2" />
                      На главную
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => window.history.back()}
                    className="min-w-[140px]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Назад
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <p className="mb-4">Если проблема повторяется, свяжитесь с нами:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/contact"
                className="text-primary hover:underline transition-colors"
              >
                Контакты
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link
                href="/catalog"
                className="text-primary hover:underline transition-colors"
              >
                Каталог товаров
              </Link>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-destructive/5 rounded-full blur-xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-4 w-16 h-16 bg-muted/20 rounded-full blur-lg" />
        </motion.div>
      </div>
    </div>
  );
}
