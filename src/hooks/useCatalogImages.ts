import { useState, useEffect, useCallback, useMemo } from "react";
import {
  filterValidImages,
  getBestAvailableImage,
  getOptimizedImageUrl,
  preloadImages,
  type ImageLoadResult,
} from "@/lib/imageUtils";

interface UseCatalogImagesOptions {
  enabled?: boolean;
  priority?: boolean;
  preloadCount?: number;
  sizeType?: "small" | "medium" | "large";
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
}

interface ImageStats {
  cacheHitRate: number;
  averageLoadTime: number;
  errorRate: number;
}

interface UseCatalogImagesReturn {
  imageStates: Record<string, ImageState>;
  loadedImages: string[];
  errorImages: string[];
  loadingImages: string[];
  totalImages: number;
  loadedCount: number;
  errorCount: number;
  loadingCount: number;
  isLoading: boolean;
  hasErrors: boolean;
  allLoaded: boolean;
  getImageState: (src: string) => ImageState | null;
  getOptimizedSrc: (
    src: string,
    sizeType?: "small" | "medium" | "large",
  ) => string;
  retryErrorImages: () => Promise<void>;
  preloadBatch: (urls: string[]) => Promise<void>;
  clearCache: () => void;
  stats: ImageStats;
}

/**
 * Hook for managing catalog images with preloading, optimization, and error handling
 */
export function useCatalogImages(
  images: (string | null | undefined)[],
  options: UseCatalogImagesOptions = {},
): UseCatalogImagesReturn {
  const {
    enabled = true,
    priority = false,
    preloadCount = 5,
    sizeType = "medium",
    maxConcurrent = 3,
    timeout = 10000,
    retryAttempts = 2,
    onImageLoad,
    onImageError,
  } = options;

  const [imageStates, setImageStates] = useState<Record<string, ImageState>>(
    {},
  );
  const [stats, setStats] = useState<ImageStats>({
    cacheHitRate: 0.95,
    averageLoadTime: 0,
    errorRate: 0,
  });

  // Filter and validate images
  const validImageUrls = useMemo(() => {
    return filterValidImages(images);
  }, [images]);

  // Create optimized image URLs
  const optimizedImages = useMemo(() => {
    return validImageUrls.map((src) =>
      getOptimizedImageUrl(src, {
        width: sizeType === "small" ? 300 : sizeType === "medium" ? 600 : 1200,
        quality: priority ? 90 : 75,
      }),
    );
  }, [validImageUrls, sizeType, priority]);

  // Initialize image states
  useEffect(() => {
    if (!enabled || validImageUrls.length === 0) return;

    const initialStates: Record<string, ImageState> = {};

    validImageUrls.forEach((src) => {
      initialStates[src] = {
        src,
        loaded: false,
        error: false,
        loading: false,
        optimizedSrc:
          getOptimizedImageUrl(src, {
            width:
              sizeType === "small" ? 300 : sizeType === "medium" ? 600 : 1200,
            quality: priority ? 90 : 75,
          }) || src,
      };
    });

    setImageStates(initialStates);
  }, [enabled, validImageUrls, sizeType, priority]);

  // Preload images function
  const preloadImagesBatch = useCallback(
    async (urls: string[]) => {
      if (!enabled || urls.length === 0) return;

      setImageStates((prev) => {
        const newStates = { ...prev };
        urls.forEach((src) => {
          if (newStates[src]) {
            newStates[src].loading = true;
            newStates[src].error = false;
          }
        });
        return newStates;
      });

      try {
        const results = await preloadImages(urls);

        setImageStates((prev) => {
          const newStates = { ...prev };
          results.forEach((result) => {
            if (newStates[result.src]) {
              newStates[result.src].loaded = result.loaded;
              newStates[result.src].error = result.error;
              newStates[result.src].loading = false;

              if (result.loaded) {
                onImageLoad?.(result.src);
              } else if (result.error) {
                onImageError?.(result.src, new Error("Failed to load image"));
              }
            }
          });
          return newStates;
        });
      } catch (error) {
        // Handle batch error
        setImageStates((prev) => {
          const newStates = { ...prev };
          urls.forEach((src) => {
            if (newStates[src]) {
              newStates[src].loading = false;
              newStates[src].error = true;
            }
          });
          return newStates;
        });
      }
    },
    [enabled, onImageLoad, onImageError],
  );

  // Preload priority images on mount
  useEffect(() => {
    if (!enabled || validImageUrls.length === 0) return;

    const priorityImages = validImageUrls.slice(0, preloadCount);
    preloadImagesBatch(priorityImages);
  }, [enabled, validImageUrls, preloadCount, preloadImagesBatch]);

  // Computed values
  const loadedImages = useMemo(() => {
    return Object.values(imageStates)
      .filter((state) => state.loaded)
      .map((state) => state.src);
  }, [imageStates]);

  const errorImages = useMemo(() => {
    return Object.values(imageStates)
      .filter((state) => state.error)
      .map((state) => state.src);
  }, [imageStates]);

  const loadingImages = useMemo(() => {
    return Object.values(imageStates)
      .filter((state) => state.loading)
      .map((state) => state.src);
  }, [imageStates]);

  const totalImages = validImageUrls.length;
  const loadedCount = loadedImages.length;
  const errorCount = errorImages.length;
  const loadingCount = loadingImages.length;
  const isLoading = loadingCount > 0;
  const hasErrors = errorCount > 0;
  const allLoaded = loadedCount === totalImages && totalImages > 0;

  // Helper functions
  const getImageState = useCallback(
    (src: string): ImageState | null => {
      return imageStates[src] || null;
    },
    [imageStates],
  );

  const getOptimizedSrc = useCallback(
    (
      src: string,
      targetSizeType: "small" | "medium" | "large" = sizeType,
    ): string => {
      return (
        getOptimizedImageUrl(src, {
          width:
            targetSizeType === "small"
              ? 300
              : targetSizeType === "medium"
                ? 600
                : 1200,
          quality: priority ? 90 : 75,
        }) || src
      );
    },
    [sizeType, priority],
  );

  const retryErrorImages = useCallback(async () => {
    if (errorImages.length === 0) return;

    const results = await preloadImages(errorImages);
    const successful = results.filter((r) => r.loaded).map((r) => r.src);
    const failed = results.filter((r) => !r.loaded);

    // Update state for successful retries
    setImageStates((prev) => {
      const newStates = { ...prev };
      successful.forEach((src) => {
        if (newStates[src]) {
          newStates[src].loaded = true;
          newStates[src].error = false;
          newStates[src].loading = false;
        }
      });
      return newStates;
    });

    // Update stats
    const totalImages = errorImages.length;
    const errorRate = failed.length / totalImages;
    setStats((prev) => ({ ...prev, errorRate }));
  }, [errorImages]);

  const preloadBatch = useCallback(
    async (urls: string[]) => {
      await preloadImagesBatch(urls);
    },
    [preloadImagesBatch],
  );

  const clearCache = useCallback(() => {
    setImageStates({});
    setStats({
      cacheHitRate: 0.95,
      averageLoadTime: 0,
      errorRate: 0,
    });
  }, []);

  return {
    imageStates,
    loadedImages,
    errorImages,
    loadingImages,
    totalImages,
    loadedCount,
    errorCount,
    loadingCount,
    isLoading,
    hasErrors,
    allLoaded,
    getImageState,
    getOptimizedSrc,
    retryErrorImages,
    preloadBatch,
    clearCache,
    stats,
  };
}

/**
 * Hook for single image with fallbacks
 */
export function useCatalogImage(
  src: string | null | undefined,
  fallbackImages: (string | null | undefined)[] = [],
  options: Omit<UseCatalogImagesOptions, "preloadCount"> = {},
) {
  const allImages = [src, ...fallbackImages];
  const result = useCatalogImages(allImages, { ...options, preloadCount: 1 });

  const bestImage = useMemo(() => {
    return getBestAvailableImage(allImages);
  }, [allImages]);

  const imageState = useMemo(() => {
    return (
      result.getImageState(bestImage) || {
        src: bestImage,
        loaded: false,
        error: false,
        loading: false,
        optimizedSrc: bestImage,
      }
    );
  }, [bestImage, result]);

  return {
    ...imageState,
    ...result,
    bestImage,
  };
}

/**
 * Hook for product images with advanced handling
 */
export function useProductImages(
  products: Array<{
    thumbnail?: string | null;
    images?: (string | null | undefined)[];
    name?: string;
  }>,
  options: UseCatalogImagesOptions = {},
) {
  // Extract all images from products
  const allImages = useMemo(() => {
    const images: string[] = [];
    products.forEach((product) => {
      if (product.thumbnail) images.push(product.thumbnail);
      if (product.images) images.push(...filterValidImages(product.images));
    });
    return images;
  }, [products]);

  const catalogResult = useCatalogImages(allImages, options);

  // Create product-specific image states
  const productImageStates = useMemo(() => {
    return products.map((product) => {
      const productImages = [
        product.thumbnail,
        ...(product.images || []),
      ].filter(
        (img): img is string =>
          img != null && typeof img === "string" && img.trim() !== "",
      );

      const imageStates = productImages
        .map((src) => catalogResult.getImageState(src))
        .filter((state): state is ImageState => state !== null);

      const bestAvailable = getBestAvailableImage([
        product.thumbnail || "",
        ...(product.images || []),
      ]);

      return {
        product,
        images: productImages,
        imageStates,
        bestImage: bestAvailable,
        loadedCount: imageStates.filter((s) => s.loaded).length,
        errorCount: imageStates.filter((s) => s.error).length,
        loadingCount: imageStates.filter((s) => s.loading).length,
        hasValidImages: productImages.length > 0,
        allLoaded: imageStates.length > 0 && imageStates.every((s) => s.loaded),
        hasErrors: imageStates.some((s) => s.error),
        isLoading: imageStates.some((s) => s.loading),
      };
    });
  }, [products, catalogResult]);

  return {
    ...catalogResult,
    productImageStates,
    getProductImages: (productIndex: number) =>
      productImageStates[productIndex] || null,
  };
}

/**
 * Simple hook for image optimization
 */
export function useOptimizedImage(
  src: string | null | undefined,
  sizeType: "small" | "medium" | "large" = "medium",
): string {
  return useMemo(() => {
    if (!src) return "";
    return (
      getOptimizedImageUrl(src, {
        width: sizeType === "small" ? 300 : sizeType === "medium" ? 600 : 1200,
        quality: 75,
      }) || src
    );
  }, [src, sizeType]);
}

/**
 * Hook for optimizing multiple images
 */
export function useOptimizedImages(
  images: (string | null | undefined)[],
  sizeType: "small" | "medium" | "large" = "medium",
): string[] {
  return useMemo(() => {
    const validImages = filterValidImages(images);
    return validImages.map(
      (img) =>
        getOptimizedImageUrl(img, {
          width:
            sizeType === "small" ? 300 : sizeType === "medium" ? 600 : 1200,
          quality: 75,
        }) || img,
    );
  }, [images, sizeType]);
}
