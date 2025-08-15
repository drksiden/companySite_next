"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTime?: number; // время жизни кэша в миллисекундах
  dedupe?: boolean; // дедупликация одинаковых запросов
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Глобальный кэш для всех компонентов
const globalCache = new Map<
  string,
  {
    data: any;
    timestamp: number;
    promise?: Promise<any>;
  }
>();

// Активные запросы для дедупликации
const activeRequests = new Map<string, Promise<any>>();

export function useOptimizedFetch<T>(
  url: string | null,
  options: FetchOptions = {},
) {
  const {
    method = "GET",
    headers = {},
    body,
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 минут по умолчанию
    dedupe = true,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  // Создаем уникальный ключ для кэша
  const cacheKey = useCallback(() => {
    if (!url) return null;
    const key = `${method}:${url}`;
    if (body) {
      return `${key}:${JSON.stringify(body)}`;
    }
    return key;
  }, [url, method, body]);

  // Проверяем кэш
  const getCachedData = useCallback(
    (key: string) => {
      if (!cache) return null;

      const cached = globalCache.get(key);
      if (!cached) return null;

      const isExpired = Date.now() - cached.timestamp > cacheTime;
      if (isExpired) {
        globalCache.delete(key);
        return null;
      }

      return cached.data;
    },
    [cache, cacheTime],
  );

  // Сохраняем в кэш
  const setCachedData = useCallback(
    (key: string, data: any) => {
      if (!cache) return;

      globalCache.set(key, {
        data,
        timestamp: Date.now(),
      });
    },
    [cache],
  );

  // Основная функция fetch
  const fetchData = useCallback(
    async (signal: AbortSignal): Promise<T> => {
      if (!url) throw new Error("URL is required");

      const key = cacheKey();
      if (!key) throw new Error("Invalid cache key");

      // Проверяем кэш
      const cachedData = getCachedData(key);
      if (cachedData) {
        return cachedData;
      }

      // Дедупликация запросов
      if (dedupe && activeRequests.has(key)) {
        return activeRequests.get(key)!;
      }

      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        signal,
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      const fetchPromise = fetch(url, requestOptions)
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          return response.json();
        })
        .then((data) => {
          // Сохраняем в кэш
          setCachedData(key, data);
          return data;
        })
        .finally(() => {
          // Удаляем из активных запросов
          if (dedupe) {
            activeRequests.delete(key);
          }
        });

      // Добавляем в активные запросы
      if (dedupe) {
        activeRequests.set(key, fetchPromise);
      }

      return fetchPromise;
    },
    [
      url,
      method,
      headers,
      body,
      dedupe,
      cacheKey,
      getCachedData,
      setCachedData,
    ],
  );

  // Функция для принудительного обновления
  const refetch = useCallback(async () => {
    if (!url) return;

    const key = cacheKey();
    if (key) {
      // Очищаем кэш для этого ключа
      globalCache.delete(key);
      // Удаляем из активных запросов
      activeRequests.delete(key);
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый контроллер
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetchData(abortControllerRef.current.signal);

      if (mountedRef.current) {
        setState({
          data,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      if (mountedRef.current && error.name !== "AbortError") {
        setState({
          data: null,
          loading: false,
          error: error.message || "Произошла ошибка",
        });
      }
    }
  }, [url, fetchData, cacheKey]);

  // Основной эффект для загрузки данных
  useEffect(() => {
    if (!url) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    const key = cacheKey();
    if (!key) return;

    // Проверяем кэш
    const cachedData = getCachedData(key);
    if (cachedData) {
      setState({
        data: cachedData,
        loading: false,
        error: null,
      });
      return;
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый контроллер
    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchData(abortControllerRef.current.signal)
      .then((data) => {
        if (mountedRef.current) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      })
      .catch((error: any) => {
        if (mountedRef.current && error.name !== "AbortError") {
          setState({
            data: null,
            loading: false,
            error: error.message || "Произошла ошибка",
          });
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, fetchData, cacheKey, getCachedData]);

  // Cleanup при размонтировании
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    // Функция для очистки кэша
    clearCache: useCallback(() => {
      const key = cacheKey();
      if (key) {
        globalCache.delete(key);
      }
    }, [cacheKey]),
    // Функция для очистки всего кэша
    clearAllCache: useCallback(() => {
      globalCache.clear();
      activeRequests.clear();
    }, []),
  };
}

// Дополнительные утилиты для работы с кэшем
export const cacheUtils = {
  // Очистить весь кэш
  clearAll: () => {
    globalCache.clear();
    activeRequests.clear();
  },

  // Очистить кэш по паттерну
  clearByPattern: (pattern: string) => {
    for (const key of globalCache.keys()) {
      if (key.includes(pattern)) {
        globalCache.delete(key);
      }
    }
    for (const key of activeRequests.keys()) {
      if (key.includes(pattern)) {
        activeRequests.delete(key);
      }
    }
  },

  // Получить размер кэша
  getCacheSize: () => globalCache.size,

  // Получить все ключи кэша
  getCacheKeys: () => Array.from(globalCache.keys()),

  // Предзагрузка данных
  prefetch: async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
    const {
      method = "GET",
      headers = {},
      body,
      cache = true,
      cacheTime = 5 * 60 * 1000,
    } = options;

    const key = `${method}:${url}${body ? `:${JSON.stringify(body)}` : ""}`;

    // Проверяем кэш
    const cached = globalCache.get(key);
    if (cached && cache) {
      const isExpired = Date.now() - cached.timestamp > cacheTime;
      if (!isExpired) {
        return cached.data;
      }
    }

    // Выполняем запрос
    const requestOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (body && method !== "GET") {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Сохраняем в кэш
    if (cache) {
      globalCache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }

    return data;
  },
};
