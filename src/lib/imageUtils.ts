export interface ImageLoadResult {
  loaded: boolean;
  error: boolean;
  src: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpg" | "png" | "avif";
}

export function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return false;
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.includes("undefined") || trimmedUrl.includes("null")) {
    return false;
  }

  return (
    trimmedUrl.startsWith("http://") ||
    trimmedUrl.startsWith("https://") ||
    trimmedUrl.startsWith("/")
  );
}

export function getOptimizedImageSrc(
  src: string | null | undefined,
  fallback = "/placeholder.jpg",
): string {
  if (!isValidImageUrl(src)) {
    return fallback;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return src.startsWith("/") ? src : `/${src}`;
}

export function filterValidImages(
  images: (string | null | undefined)[],
): string[] {
  return images.filter(isValidImageUrl);
}

export function getBestAvailableImage(
  images: (string | null | undefined)[],
  preferredSize?: "small" | "medium" | "large",
): string {
  const validImages = filterValidImages(images);

  if (validImages.length === 0) {
    return "/placeholder.jpg";
  }

  if (!preferredSize) {
    return validImages[0];
  }

  const sizeIndicators = {
    small: ["thumb", "small", "_s"],
    medium: ["medium", "_m"],
    large: ["large", "big", "_l", "xl"],
  };

  const indicators = sizeIndicators[preferredSize];
  const preferredImage = validImages.find((img) =>
    indicators.some((indicator) => img.toLowerCase().includes(indicator)),
  );

  return preferredImage || validImages[0];
}

export function getOptimizedImageUrl(
  thumbnail?: string,
  options: ImageOptimizationOptions = {},
): string | null {
  const baseUrl = getOptimizedImageSrc(thumbnail);
  if (!baseUrl || baseUrl === "/placeholder.jpg") return null;

  if (baseUrl.startsWith("http")) {
    return baseUrl;
  }

  const params = new URLSearchParams();
  if (options.width) params.set("w", options.width.toString());
  if (options.height) params.set("h", options.height.toString());
  if (options.quality) params.set("q", options.quality.toString());
  if (options.format) params.set("f", options.format);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export function preloadImage(src: string): Promise<ImageLoadResult> {
  return new Promise((resolve) => {
    if (!src || typeof src !== "string") {
      resolve({ loaded: false, error: true, src });
      return;
    }

    const img = new Image();

    img.onload = () => {
      resolve({ loaded: true, error: false, src });
    };

    img.onerror = () => {
      resolve({ loaded: false, error: true, src });
    };

    setTimeout(() => {
      resolve({ loaded: false, error: true, src });
    }, 10000);

    img.src = src;
  });
}

export function preloadImages(sources: string[]): Promise<ImageLoadResult[]> {
  const validSources = sources.filter(isValidImageUrl);
  return Promise.all(validSources.map(preloadImage));
}

export function getFirstValidImage(
  images: (string | null | undefined)[],
): string {
  const validImage = images.find((img) => isValidImageUrl(img));
  return validImage || "/placeholder.jpg";
}
