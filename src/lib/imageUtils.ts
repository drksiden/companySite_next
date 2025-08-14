/**
 * Unified image utilities for the application
 * Combines functionality from multiple image utility files
 */

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
  format?: 'webp' | 'jpg' | 'png' | 'avif';
}

/**
 * Check if a URL is a valid image URL
 */
export function isValidImageUrl(url: string | null | undefined): url is string {
  return Boolean(
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    !url.includes('undefined') &&
    !url.includes('null') &&
    (url.startsWith('http') || url.startsWith('/'))
  );
}

/**
 * Get optimized image src with fallback
 */
export function getOptimizedImageSrc(
  src: string | null | undefined,
  fallback = '/placeholder.jpg'
): string {
  if (!isValidImageUrl(src)) {
    return fallback;
  }

  // For external URLs, return as is
  if (src.startsWith('http')) {
    return src;
  }

  // For local paths, ensure they start with /
  return src.startsWith('/') ? src : `/${src}`;
}

/**
 * Get the first valid image from an array
 */
export function getFirstValidImage(images: (string | null | undefined)[]): string {
  const validImage = images.find(img => isValidImageUrl(img));
  return validImage || '/placeholder.jpg';
}

/**
 * Preload a single image
 */
export function preloadImage(src: string): Promise<ImageLoadResult> {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string') {
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

    // Set timeout for loading
    setTimeout(() => {
      resolve({ loaded: false, error: true, src });
    }, 10000);

    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export async function preloadImages(
  sources: string[]
): Promise<ImageLoadResult[]> {
  const validSources = sources.filter(isValidImageUrl);
  return Promise.all(validSources.map(preloadImage));
}

/**
 * Get image dimensions
 */
export function getImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get accepted image formats
 */
export function getAcceptedImageFormats(): string[] {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
}

/**
 * Validate image file size
 */
export function validateImageSize(file: File, maxSizeInMB = 20): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Create blur data URL for placeholder
 */
export function getBlurDataURL(): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
}

/**
 * Create SVG placeholder
 */
export function getPlaceholderImageUrl(
  width = 400,
  height = 400,
  text = "Нет изображения"
): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `)}`;
}

/**
 * Create sizes string for Next.js Image component
 */
export function createImageSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ');
}

/**
 * Standard sizes for different image types
 */
export const imageSizes = {
  thumbnail: createImageSizes({
    '640px': '100vw',
    '768px': '50vw',
    '1024px': '33vw',
    '1280px': '25vw'
  }),
  hero: createImageSizes({
    '768px': '100vw',
    '1024px': '100vw'
  }),
  product: createImageSizes({
    '640px': '100vw',
    '768px': '100vw',
    '1024px': '50vw'
  }),
  gallery: createImageSizes({
    '640px': '100vw',
    '768px': '50vw',
    '1024px': '600px'
  })
};

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get optimized image URL with parameters
 */
export function getOptimizedImageUrl(
  thumbnail?: string,
  options: ImageOptimizationOptions = {}
): string | null {
  const baseUrl = getOptimizedImageSrc(thumbnail);
  if (!baseUrl || baseUrl === '/placeholder.jpg') return null;

  // If it's an external URL, return as is
  if (baseUrl.startsWith("http")) {
    return baseUrl;
  }

  // Add optimization parameters for internal URLs
  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Filter out invalid images from array
 */
export function filterValidImages(images: (string | null | undefined)[]): string[] {
  return images.filter(isValidImageUrl);
}

/**
 * Get best available image with size preference
 */
export function getBestAvailableImage(
  images: (string | null | undefined)[],
  preferredSize?: 'small' | 'medium' | 'large'
): string {
  const validImages = filterValidImages(images);

  if (validImages.length === 0) {
    return '/placeholder.jpg';
  }

  // If no size preference, return first valid image
  if (!preferredSize) {
    return validImages[0];
  }

  // Try to find image with size indicator in filename
  const sizeIndicators = {
    small: ['thumb', 'small', '_s'],
    medium: ['medium', '_m'],
    large: ['large', 'big', '_l', 'xl']
  };

  const indicators = sizeIndicators[preferredSize];
  const preferredImage = validImages.find(img =>
    indicators.some(indicator => img.toLowerCase().includes(indicator))
  );

  return preferredImage || validImages[0];
}
