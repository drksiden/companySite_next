import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  imageCache,
  filterValidImages,
  getBestAvailableImage,
  optimizeImageUrl,
  preloadImages,
  type ImageSizeType,
} from "@/utils/imageOptimization";

interface UseCatalogImagesOptions {
  enabled?: boolean;
  priority?: boolean;
  preloadCount?: number;
  sizeType?: ImageSizeType;
  maxConcurrent?: number;
  timeout?: number;
  retryAttempts?: number;
  onImageLoad?: (src: string) => void;
  onImageError?: (src: string, error: Error) => void;
}

interface ImageState {
  src: string;
  loaded: boolean;
  error: boolean;
  loading: boolean;
  optimizedSrc: string;
  retryCount: number;
}

interface UseCatalogImagesResult {
  // Состояние загрузки
  isLoading: boolean;
  hasErrors: boolean;
  loadedCount: number;
  totalCount: number;

  // Данные изображений
  images: Map<string, ImageState>;
  optimizedImages: string[];

  // Утилиты
  getImageState: (src: string) => ImageState | null;
  isImageLoaded: (src: string) => boolean;
  hasImageError: (src: string) => boolean;
  getOptimizedSrc: (src: string, sizeType?: ImageSizeType) => string;

  // Действия
  preloadImage: (src: string) => Promise<void>;
  retryImage: (src: string) => Promise<void>;
  retryAll: () => Promise<void>;
  clearCache: () => void;

  // Статистика
  stats: {
    cacheHitRate: number;
    averageLoadTime: number;
    errorRate: number;
    loadedCount: number;
    totalImages: number;
  };
}

export function useCatalogImages(
  imageUrls: (string | null | undefined)[],
  options: UseCatalogImagesOptions = {},
): UseCatalogImagesResult {
  const {
    enabled = true,
    priority = false,
    preloadCount = 6,
    sizeType = "card",
    maxConcurrent = 3,
    timeout = 10000,
    retryAttempts = 2,
    onImageLoad,
    onImageError,
  } = options;

  const [images, setImages] = useState<Map<string, ImageState>>(new Map());
  const [stats, setStats] = useState({
    cacheHitRate: 0,
    averageLoadTime: 0,
    errorRate: 0,
  });

  // Используем refs для стабильного отслеживания состояния
  const urlsStringRef = useRef<string>("");
  const prevEnabledRef = useRef(enabled);
  const prevSizeTypeRef = useRef(sizeType);

  // Фильтруем и нормализуем URL изображений
  const validImageUrls = useMemo(() => {
    return filterValidImages(imageUrls);
  }, [imageUrls]);

  // Создаем оптимизированные версии URL
  const optimizedImages = useMemo(() => {
    return validImageUrls.map((src) => optimizeImageUrl(src, sizeType));
  }, [validImageUrls, sizeType]);

  // Инициализация состояния изображений
  useEffect(() => {
    const currentUrlsString = JSON.stringify(validImageUrls);

    // Проверяем, действительно ли что-то изменилось
    if (
      currentUrlsString === urlsStringRef.current &&
      enabled === prevEnabledRef.current &&
      sizeType === prevSizeTypeRef.current
    ) {
      return; // Ничего не изменилось, выходим
    }

    // Обновляем refs
    urlsStringRef.current = currentUrlsString;
    prevEnabledRef.current = enabled;
    prevSizeTypeRef.current = sizeType;

    if (!enabled || validImageUrls.length === 0) {
      setImages(new Map());
      return;
    }

    const newImages = new Map<string, ImageState>();

    validImageUrls.forEach((src) => {
      newImages.set(src, {
        src,
        loaded: imageCache.has(src),
        error: false,
        loading: !imageCache.has(src),
        optimizedSrc: optimizeImageUrl(src, sizeType),
        retryCount: 0,
      });
    });

    setImages(newImages);
  }, [validImageUrls, enabled, sizeType]);

  // Функция предзагрузки одного изображения
  const preloadImage = useCallback(
    async (src: string): Promise<void> => {
      if (!src || images.get(src)?.loaded) return;

      const startTime = Date.now();

      setImages((prev) => {
        const updated = new Map(prev);
        const state = updated.get(src) || {
          src,
          loaded: false,
          error: false,
          loading: true,
          optimizedSrc: optimizeImageUrl(src, sizeType),
          retryCount: 0,
        };

        updated.set(src, { ...state, loading: true, error: false });
        return updated;
      });

      try {
        // Проверяем кэш
        if (imageCache.has(src)) {
          setImages((prev) => {
            const updated = new Map(prev);
            const state = updated.get(src)!;
            updated.set(src, { ...state, loaded: true, loading: false });
            return updated;
          });
          onImageLoad?.(src);
          return;
        }

        // Загружаем изображение
        const img = new Image();

        if (priority && "fetchPriority" in img) {
          (img as any).fetchPriority = "high";
        }

        // Promise для загрузки с таймаутом
        const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load: ${src}`));

          setTimeout(() => {
            reject(new Error(`Timeout loading: ${src}`));
          }, timeout);
        });

        img.src = optimizeImageUrl(src, sizeType);
        const loadedImg = await loadPromise;

        // Сохраняем в кэш
        imageCache.set(src, loadedImg);

        // Обновляем состояние
        setImages((prev) => {
          const updated = new Map(prev);
          const state = updated.get(src)!;
          updated.set(src, {
            ...state,
            loaded: true,
            loading: false,
            error: false,
          });
          return updated;
        });

        // Обновляем статистику
        const loadTime = Date.now() - startTime;
        setStats((prev) => ({
          ...prev,
          averageLoadTime: (prev.averageLoadTime + loadTime) / 2,
        }));

        onImageLoad?.(src);
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Unknown error");

        setImages((prev) => {
          const updated = new Map(prev);
          const state = updated.get(src)!;
          updated.set(src, {
            ...state,
            loaded: false,
            loading: false,
            error: true,
            retryCount: state.retryCount + 1,
          });
          return updated;
        });

        onImageError?.(src, err);
      }
    },
    [images, sizeType, priority, timeout, onImageLoad, onImageError],
  );

  // Функция retry для конкретного изображения
  const retryImage = useCallback(
    async (src: string): Promise<void> => {
      const imageState = images.get(src);
      if (!imageState || imageState.retryCount >= retryAttempts) return;

      await preloadImage(src);
    },
    [images, retryAttempts, preloadImage],
  );

  // Retry всех изображений с ошибками
  const retryAll = useCallback(async (): Promise<void> => {
    const errorImages = Array.from(images.entries())
      .filter(([_, state]) => state.error && state.retryCount < retryAttempts)
      .map(([src]) => src);

    if (errorImages.length === 0) return;

    const { successful, failed } = await preloadImages(errorImages, {
      sizeType,
      maxConcurrent,
      priority,
      timeout,
    });

    // Обновляем состояние успешных
    successful.forEach((src) => {
      setImages((prev) => {
        const updated = new Map(prev);
        const state = updated.get(src)!;
        updated.set(src, {
          ...state,
          loaded: true,
          error: false,
          loading: false,
        });
        return updated;
      });
    });

    // Обновляем состояние неудачных
    failed.forEach(({ src }) => {
      setImages((prev) => {
        const updated = new Map(prev);
        const state = updated.get(src)!;
        updated.set(src, {
          ...state,
          error: true,
          loading: false,
          retryCount: state.retryCount + 1,
        });
        return updated;
      });
    });
  }, [images, retryAttempts, sizeType, maxConcurrent, priority, timeout]);

  // Очистка кэша
  const clearCache = useCallback(() => {
    imageCache.clear();
    setImages((prev) => {
      const updated = new Map();
      prev.forEach((state, src) => {
        updated.set(src, {
          ...state,
          loaded: false,
          loading: true,
          error: false,
          retryCount: 0,
        });
      });
      return updated;
    });
  }, []);

  // Утилиты
  const getImageState = useCallback(
    (src: string): ImageState | null => {
      return images.get(src) || null;
    },
    [images],
  );

  const isImageLoaded = useCallback(
    (src: string): boolean => {
      return images.get(src)?.loaded ?? false;
    },
    [images],
  );

  const hasImageError = useCallback(
    (src: string): boolean => {
      return images.get(src)?.error ?? false;
    },
    [images],
  );

  const getOptimizedSrc = useCallback(
    (src: string, targetSizeType: ImageSizeType = sizeType): string => {
      return optimizeImageUrl(src, targetSizeType);
    },
    [sizeType],
  );

  // Автоматическая предзагрузка приоритетных изображений
  useEffect(() => {
    if (!enabled || validImageUrls.length === 0) return;

    const priorityImages = validImageUrls.slice(0, preloadCount);

    const loadPriorityImages = async () => {
      const { successful, failed } = await preloadImages(priorityImages, {
        sizeType,
        maxConcurrent: priority ? 6 : maxConcurrent,
        priority,
        timeout,
      });

      // Обновляем статистику
      const totalImages = priorityImages.length;
      const errorRate = failed.length / totalImages;
      const cacheStats = imageCache.getStats();

      setStats({
        cacheHitRate: cacheStats.hitRate,
        averageLoadTime: 0, // Будет обновляться в preloadImage
        errorRate,
      });
    };

    loadPriorityImages();
  }, [
    enabled,
    validImageUrls,
    preloadCount,
    sizeType,
    maxConcurrent,
    priority,
    timeout,
  ]);

  // Вычисляемые значения
  const isLoading = useMemo(() => {
    return Array.from(images.values()).some((state) => state.loading);
  }, [images]);

  const hasErrors = useMemo(() => {
    return Array.from(images.values()).some((state) => state.error);
  }, [images]);

  const loadedCount = useMemo(() => {
    return Array.from(images.values()).filter((state) => state.loaded).length;
  }, [images]);

  const totalCount = useMemo(() => {
    return validImageUrls.length;
  }, [validImageUrls]);

  // Вычисляем финальную статистику
  const finalStats = useMemo(
    () => ({
      ...stats,
      loadedCount,
      totalImages: totalCount,
    }),
    [stats, loadedCount, totalCount],
  );

  return {
    // Состояние загрузки
    isLoading,
    hasErrors,
    loadedCount,
    totalCount,

    // Данные
    images,
    optimizedImages,

    // Утилиты
    getImageState,
    isImageLoaded,
    hasImageError,
    getOptimizedSrc,

    // Действия
    preloadImage,
    retryImage,
    retryAll,
    clearCache,

    // Статистика
    stats: finalStats,
  };
}

/**
 * Хук для единственного изображения с полным контролем
 */
export function useSingleImage(
  src: string | null | undefined,
  fallbackImages: string[] = [],
  options: UseCatalogImagesOptions = {},
) {
  const allImages = [src, ...fallbackImages];
  const result = useCatalogImages(allImages, { ...options, preloadCount: 1 });

  const bestImage = useMemo(() => {
    return getBestAvailableImage(src, fallbackImages);
  }, [src, fallbackImages]);

  const imageState = useMemo(() => {
    return bestImage ? result.getImageState(bestImage) : null;
  }, [bestImage, result]);

  return {
    ...result,
    src: bestImage,
    state: imageState,
    loaded: imageState?.loaded ?? false,
    error: imageState?.error ?? false,
    loading: imageState?.loading ?? false,
    optimizedSrc: bestImage ? result.getOptimizedSrc(bestImage) : null,
  };
}

/**
 * Хук для предзагрузки изображений товаров в каталоге
 */
export function useProductImages(
  products: Array<{
    id: string;
    thumbnail?: string;
    images?: string[];
    name: string;
  }>,
  options: UseCatalogImagesOptions = {},
) {
  // Создаем стабильные изображения для продуктов
  const productsStringRef = useRef<string>("");
  const cachedImagesRef = useRef<(string | null | undefined)[]>([]);

  // Собираем все изображения из продуктов с проверкой изменений
  const allProductImages = useMemo(() => {
    const currentProductsString = JSON.stringify(
      products.map((p) => ({
        id: p.id,
        thumbnail: p.thumbnail,
        images: p.images,
      })),
    );

    // Если продукты не изменились, возвращаем кэшированный результат
    if (currentProductsString === productsStringRef.current) {
      return cachedImagesRef.current;
    }

    // Обновляем кэш
    productsStringRef.current = currentProductsString;
    const newImages = products.flatMap((product) => [
      product.thumbnail,
      ...(product.images || []),
    ]);
    cachedImagesRef.current = newImages;

    return newImages;
  }, [products]);

  const result = useCatalogImages(allProductImages, options);

  // Создаем маппинг продуктов к их изображениям
  const productImageStates = useMemo(() => {
    const mapping = new Map<
      string,
      {
        thumbnail: ImageState | null;
        gallery: ImageState[];
        bestAvailable: string | null;
      }
    >();

    products.forEach((product) => {
      const thumbnail = result.getImageState(product.thumbnail || "");
      const gallery = (product.images || [])
        .map((img) => result.getImageState(img))
        .filter((state): state is ImageState => state !== null);

      const bestAvailable = getBestAvailableImage(
        product.thumbnail,
        product.images,
      );

      mapping.set(product.id, {
        thumbnail,
        gallery,
        bestAvailable,
      });
    });

    return mapping;
  }, [products, result]);

  return {
    ...result,
    productImageStates,
    getProductImages: (productId: string) => productImageStates.get(productId),
  };
}

/**
 * Хук для галереи изображений с расширенными возможностями
 */
export function useImageGallery(
  images: string[],
  options: UseCatalogImagesOptions & {
    initialIndex?: number;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelay?: number;
  } = {},
) {
  const {
    initialIndex = 0,
    loop = false,
    autoplay = false,
    autoplayDelay = 3000,
    ...imageOptions
  } = options;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  const imageResult = useCatalogImages(images, {
    ...imageOptions,
    priority: true, // Галерея имеет приоритет
  });

  // Навигация
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (loop) {
        return (prev + 1) % images.length;
      }
      return Math.min(prev + 1, images.length - 1);
    });
  }, [images.length, loop]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (loop) {
        return prev === 0 ? images.length - 1 : prev - 1;
      }
      return Math.max(prev - 1, 0);
    });
  }, [images.length, loop]);

  const goToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
    },
    [images.length],
  );

  // Автовоспроизведение
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;

    const interval = setInterval(goToNext, autoplayDelay);
    return () => clearInterval(interval);
  }, [isPlaying, images.length, autoplayDelay, goToNext]);

  // Управление автовоспроизведением
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), []);

  // Текущее изображение
  const currentImage = images[currentIndex];
  const currentImageState = currentImage
    ? imageResult.getImageState(currentImage)
    : null;

  // Навигационная информация
  const canGoNext = loop || currentIndex < images.length - 1;
  const canGoPrev = loop || currentIndex > 0;

  return {
    ...imageResult,

    // Навигация
    currentIndex,
    currentImage,
    currentImageState,
    canGoNext,
    canGoPrev,

    // Действия навигации
    goToNext,
    goToPrev,
    goToIndex,

    // Автовоспроизведение
    isPlaying,
    play,
    pause,
    toggle,

    // Метаданные
    totalImages: images.length,
    hasMultipleImages: images.length > 1,
  };
}

/**
 * Хук для отложенной загрузки изображений (Intersection Observer)
 */
export function useLazyImages(
  containerRef: React.RefObject<HTMLElement>,
  options: UseCatalogImagesOptions & {
    rootMargin?: string;
    threshold?: number;
  } = {},
) {
  const { rootMargin = "100px", threshold = 0.1, ...imageOptions } = options;

  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const [imageElements, setImageElements] = useState<Map<string, Element>>(
    new Map(),
  );

  // Intersection Observer для отслеживания видимых изображений
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const src = entry.target.getAttribute("data-src");
          if (!src) return;

          if (entry.isIntersecting) {
            setVisibleImages((prev) => new Set(prev).add(src));
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      },
    );

    // Наблюдаем за всеми изображениями в контейнере
    const images = containerRef.current.querySelectorAll("[data-src]");
    images.forEach((img) => {
      observer.observe(img);
      const src = img.getAttribute("data-src");
      if (src) {
        setImageElements((prev) => new Map(prev).set(src, img));
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [containerRef, rootMargin, threshold]);

  // Загружаем только видимые изображения
  const imageResult = useCatalogImages(Array.from(visibleImages), {
    ...imageOptions,
    enabled: visibleImages.size > 0,
  });

  return {
    ...imageResult,
    visibleImages,
    registerImageElement: (src: string, element: Element) => {
      setImageElements((prev) => new Map(prev).set(src, element));
    },
  };
}

/**
 * Хук для мониторинга производительности загрузки изображений
 */
export function useImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    networkUsage: 0, // в байтах
  });

  const recordImageLoad = useCallback(
    (src: string, loadTime: number, fromCache: boolean) => {
      setMetrics((prev) => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        successfulRequests: prev.successfulRequests + 1,
        averageLoadTime: (prev.averageLoadTime + loadTime) / 2,
        cacheHitRate: fromCache
          ? (prev.cacheHitRate + 1) / prev.totalRequests
          : prev.cacheHitRate,
      }));
    },
    [],
  );

  const recordImageError = useCallback((src: string) => {
    setMetrics((prev) => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      failedRequests: prev.failedRequests + 1,
    }));
  }, []);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      networkUsage: 0,
    });
  }, []);

  // Вычисляемые метрики
  const successRate =
    metrics.totalRequests > 0
      ? metrics.successfulRequests / metrics.totalRequests
      : 0;

  const errorRate =
    metrics.totalRequests > 0
      ? metrics.failedRequests / metrics.totalRequests
      : 0;

  return {
    metrics: {
      ...metrics,
      successRate,
      errorRate,
    },
    recordImageLoad,
    recordImageError,
    resetMetrics,
  };
}

/**
 * Готовность к TanStack Query - интерфейсы и типы
 */
export interface TanStackImageQueryOptions {
  queryKey: string[];
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  retry?: number;
  retryDelay?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

/**
 * Подготовка к миграции на TanStack Query
 * Эмулирует интерфейс useQuery для изображений
 */
export function useTanStackReadyImages(
  imageUrls: string[],
  options: TanStackImageQueryOptions & UseCatalogImagesOptions = {
    queryKey: ["images"],
  },
) {
  const {
    queryKey,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 минут
    cacheTime = 30 * 60 * 1000, // 30 минут
    retry = 2,
    retryDelay = 1000,
    refetchOnWindowFocus = false,
    refetchOnMount = true,
    ...imageOptions
  } = options;

  const imageResult = useCatalogImages(imageUrls, {
    ...imageOptions,
    enabled,
    retryAttempts: retry,
  });

  // Симулируем TanStack Query интерфейс
  const tanStackLikeResult = useMemo(
    () => ({
      data: imageResult.optimizedImages,
      isLoading: imageResult.isLoading,
      isError: imageResult.hasErrors,
      error: imageResult.hasErrors ? new Error("Image loading failed") : null,
      isSuccess: !imageResult.isLoading && !imageResult.hasErrors,

      // TanStack Query специфичные поля
      isFetching: imageResult.isLoading,
      isStale: false, // Можно реализовать логику staleness
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: imageResult.hasErrors ? Date.now() : 0,

      // Действия
      refetch: imageResult.retryAll,
      remove: imageResult.clearCache,
    }),
    [imageResult],
  );

  return {
    ...imageResult,
    query: tanStackLikeResult,

    // Дополнительные TanStack Query методы для будущей миграции
    invalidate: imageResult.retryAll,
    setQueryData: (data: string[]) => {
      // Заглушка для будущей реализации
      console.log("setQueryData called with:", data);
    },
    getQueryData: () => imageResult.optimizedImages,
  };
}

/**
 * Критический загрузчик изображений для важного контента
 */
export function useCriticalImagePreloader(
  criticalImages: string[],
  options: UseCatalogImagesOptions = {},
) {
  const [preloadStatus, setPreloadStatus] = useState<{
    completed: number;
    total: number;
    isComplete: boolean;
  }>({
    completed: 0,
    total: criticalImages.length,
    isComplete: false,
  });

  const imageResult = useCatalogImages(criticalImages, {
    ...options,
    priority: true,
    enabled: true,
  });

  useEffect(() => {
    const loadedCount = imageResult.loadedCount;
    const total = criticalImages.length;

    setPreloadStatus({
      completed: loadedCount,
      total,
      isComplete: loadedCount === total && total > 0,
    });
  }, [imageResult.loadedCount, criticalImages.length]);

  return {
    ...imageResult,
    preloadStatus,
    isPreloadComplete: preloadStatus.isComplete,
    preloadProgress:
      preloadStatus.total > 0
        ? preloadStatus.completed / preloadStatus.total
        : 0,
  };
}

/**
 * Экспорт для будущего использования с TanStack Query
 */
export const imageQueryKeys = {
  all: ["images"] as const,
  products: () => [...imageQueryKeys.all, "products"] as const,
  product: (id: string) => [...imageQueryKeys.products(), id] as const,
  gallery: (productId: string) =>
    [...imageQueryKeys.product(productId), "gallery"] as const,
  thumbnail: (productId: string) =>
    [...imageQueryKeys.product(productId), "thumbnail"] as const,
} as const;

/**
 * Query functions для TanStack Query (для будущего использования)
 */
export const imageQueryFunctions = {
  fetchProductImages: async (productId: string): Promise<string[]> => {
    // Заглушка - в будущем здесь будет реальная загрузка через API
    const response = await fetch(`/api/products/${productId}/images`);
    if (!response.ok) throw new Error("Failed to fetch product images");
    const data = await response.json();
    return data.images;
  },

  fetchOptimizedImage: async (
    src: string,
    sizeType: ImageSizeType = "card",
  ): Promise<string> => {
    return optimizeImageUrl(src, sizeType);
  },

  preloadProductImages: async (
    productIds: string[],
    sizeType: ImageSizeType = "card",
  ): Promise<Map<string, string[]>> => {
    const results = new Map<string, string[]>();

    for (const productId of productIds) {
      try {
        const images = await imageQueryFunctions.fetchProductImages(productId);
        const optimized = images.map((img) => optimizeImageUrl(img, sizeType));
        results.set(productId, optimized);
      } catch (error) {
        console.error(
          `Failed to preload images for product ${productId}:`,
          error,
        );
        results.set(productId, []);
      }
    }

    return results;
  },
} as const;
