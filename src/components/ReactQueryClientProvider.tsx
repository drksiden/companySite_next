"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute - данные считаются свежими
            gcTime: 5 * 60 * 1000, // 5 minutes - время жизни кэша (было cacheTime)
            refetchOnWindowFocus: false, // Не обновлять при фокусе окна
            refetchOnReconnect: true, // Обновлять при переподключении
            retry: 1, // Повторить запрос 1 раз при ошибке
          },
        },
      })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
