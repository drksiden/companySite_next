import { useState, useEffect, useRef } from "react";

interface UseImagePreloaderOptions {
  enabled?: boolean;
  timeout?: number;
  priority?: boolean;
  onLoad?: (src: string) => void;
  onError?: (src: string, error: Error) => void;
}

interface ImagePreloadResult {
  loaded: boolean;
  error: boolean;
  loading: boolean;
}

export function useImagePreloader(
  src: string | string[] | null | undefined,
  options: UseImagePreloaderOptions = {},
) {
  const {
    enabled = true,
    timeout = 10000,
    priority = false,
    onLoad,
    onError,
  } = options;

  const [overallState, setOverallState] = useState<ImagePreloadResult>({
    loaded: false,
    error: false,
    loading: false,
  });

  const processedRef = useRef<string>("");

  // Нормализуем входные данные в массив валидных URL
  const imageUrls = Array.isArray(src)
    ? src.filter(
        (url): url is string =>
          url !== null &&
          url !== undefined &&
          typeof url === "string" &&
          url.trim() !== "",
      )
    : src && typeof src === "string" && src.trim() !== ""
      ? [src]
      : [];

  // Создаем ключ для отслеживания изменений
  const urlsKey = imageUrls.join("|");

  useEffect(() => {
    // Предотвращаем повторную обработку тех же URL
    if (
      !enabled ||
      imageUrls.length === 0 ||
      processedRef.current === urlsKey
    ) {
      return;
    }

    processedRef.current = urlsKey;
    setOverallState({ loaded: false, error: false, loading: true });

    let mounted = true;

    const preloadImages = async () => {
      try {
        const promises = imageUrls.map((url) => {
          return new Promise<{ url: string; success: boolean }>((resolve) => {
            const img = new Image();

            if (priority) {
              img.fetchPriority = "high";
            }

            const cleanup = () => {
              img.onload = null;
              img.onerror = null;
            };

            const timeoutId = setTimeout(() => {
              cleanup();
              const error = new Error(`Image load timeout: ${url}`);
              onError?.(url, error);
              resolve({ url, success: false });
            }, timeout);

            img.onload = () => {
              clearTimeout(timeoutId);
              cleanup();
              onLoad?.(url);
              resolve({ url, success: true });
            };

            img.onerror = () => {
              clearTimeout(timeoutId);
              cleanup();
              const error = new Error(`Failed to load image: ${url}`);
              onError?.(url, error);
              resolve({ url, success: false });
            };

            img.src = url;
          });
        });

        const results = await Promise.all(promises);

        if (!mounted) return;

        const successCount = results.filter((r) => r.success).length;
        const hasAnyLoaded = successCount > 0;
        const allFailed = successCount === 0;

        setOverallState({
          loaded: hasAnyLoaded,
          error: allFailed,
          loading: false,
        });
      } catch (error) {
        if (mounted) {
          console.error("Image preloading failed:", error);
          setOverallState({ loaded: false, error: true, loading: false });
        }
      }
    };

    preloadImages();

    return () => {
      mounted = false;
    };
  }, [urlsKey, enabled, priority, timeout]);

  return {
    loaded: overallState.loaded,
    error: overallState.error,
    loading: overallState.loading,
    imageUrls,
    totalImages: imageUrls.length,
  };
}

// Хук для предзагрузки изображений товаров в каталоге
export function useProductImagePreloader(
  products: Array<{ thumbnail?: string; images?: string[] }>,
  options: UseImagePreloaderOptions = {},
) {
  const allImages = products
    .flatMap((product) => [product.thumbnail, ...(product.images || [])])
    .filter(
      (img): img is string =>
        img !== null &&
        img !== undefined &&
        typeof img === "string" &&
        img.trim() !== "",
    );

  return useImagePreloader(allImages, {
    ...options,
    priority: false,
  });
}

// Хук для критических изображений
export function useCriticalImagePreloader(
  src: string | string[] | null | undefined,
  options: UseImagePreloaderOptions = {},
) {
  return useImagePreloader(src, {
    ...options,
    priority: true,
    timeout: 5000,
  });
}
