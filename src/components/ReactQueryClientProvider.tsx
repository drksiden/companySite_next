"use client";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any, query) => {
            // Логируем ошибки React Query
            import('@/lib/logger/client').then(({ clientLogger }) => {
              clientLogger.error('React Query error', error, {
                queryKey: query.queryKey,
                errorType: 'react-query-error',
                component: 'ReactQueryClientProvider',
                status: error?.status,
                statusText: error?.statusText,
              });
            });
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any, variables, context, mutation) => {
            // Логируем ошибки мутаций
            import('@/lib/logger/client').then(({ clientLogger }) => {
              clientLogger.error('React Query mutation error', error, {
                errorType: 'react-query-mutation-error',
                component: 'ReactQueryClientProvider',
                variables: variables,
              });
            });
          },
        }),
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
