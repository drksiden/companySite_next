"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими (увеличено для лучшего кэширования)
            gcTime: 30 * 60 * 1000, // 30 минут - время жизни кэша (увеличено)
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна
            refetchOnReconnect: true, // Обновлять при переподключении
            refetchOnMount: false, // Не обновлять при монтировании, если данные свежие
            retry: (failureCount, error: any) => {
              // Не повторять для 4xx ошибок (клиентские ошибки)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Повторить максимум 2 раза для других ошибок
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Экспоненциальная задержка
          },
          mutations: {
            retry: 1, // Повторить мутацию 1 раз при ошибке
            retryDelay: 1000,
          },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
