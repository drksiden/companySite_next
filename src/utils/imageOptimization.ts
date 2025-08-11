import type { ImageLoaderProps } from 'next/image';

// Конфигурация для различных размеров изображений
export const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 300, quality: 70 },
  card: { width: 600, height: 600, quality: 80 },
  gallery: { width: 1200, height: 1200, quality: 90 },
  fullscreen: { width: 2400, height: 2400, quality: 95 },
  hero: { width: 1920, height: 1080, quality: 85 },
} as const;

// Типы размеров
export type ImageSizeType = keyof typeof IMAGE_SIZES;

// Конфигурация для WebP и AVIF
export const MODERN_IMAGE_FORMATS = ['image/avif', 'image/webp'];

/**
 * Проверяет, поддерживает ли браузер современные форматы изображений
 */
export function checkImageFormatSupport(): Promise<{
  webp: boolean;
  avif: boolean;
}> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve({ webp: false, avif: false });
      return;
    }

    // Тестируем WebP
    const webpPromise = new Promise<boolean>((webpResolve) => {
      const webpData = canvas.toDataURL('image/webp');
      webpResolve(webpData.indexOf('data:image/webp') === 0);
    });

    // Тестируем AVIF (более сложная проверка)
    const avifPromise = new Promise<boolean>((avifResolve) => {
      const avifImg = new Image();
      avifImg.onload = () => avifResolve(true);
      avifImg.onerror = () => avifResolve(false);
      avifImg.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';
    });

    Promise.all([webpPromise, avifPromise]).then(([webp, avif]) => {
      resolve({ webp, avif });
    });
  });
}

/**
 * Кастомный загрузчик изображений для Next.js
 */
export function createImageLoader(baseUrl?: string): (props: ImageLoaderProps) => string {
  return ({ src, width, quality = 75 }: ImageLoaderProps) => {
    // Если это уже полный URL, возвращаем как есть
    if (src.startsWith('http') || src.startsWith('//')) {
      return src;
    }

    // Если указан базовый URL, используем его
    if (baseUrl) {
      return `${baseUrl}${src}?w=${width}&q=${quality}`;
    }

    // Для R2/S3 хранилищ добавляем параметры оптимизации
    if (src.includes('r2.dev') || src.includes('amazonaws.com')) {
      const url = new URL(src);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('f', 'webp');
      return url.toString();
    }

    return src;
  };
}

/**
 * Генерирует srcSet для адаптивных изображений
 */
export function generateSrcSet(
  src: string,
  sizes: number[] = [300, 600, 900, 1200],
  quality = 80
): string {
  const loader = createImageLoader();

  return sizes
    .map((size) => `${loader({ src, width: size, quality })} ${size}w`)
    .join(', ');
}

/**
 * Оптимизирует URL изображения для конкретного использования
 */
export function optimizeImageUrl(
  src: string,
  sizeType: ImageSizeType,
  format?: 'webp' | 'avif' | 'auto'
): string {
  if (!src || !isValidImageUrl(src)) {
    return src;
  }

  const config = IMAGE_SIZES[sizeType];
  const loader = createImageLoader();

  let optimizedUrl = loader({
    src,
    width: config.width,
    quality: config.quality,
  });

  // Добавляем формат если поддерживается
  if (format && format !== 'auto') {
    try {
      const url = new URL(optimizedUrl);
      url.searchParams.set('f', format);
      optimizedUrl = url.toString();
    } catch {
      // Игнорируем ошибки URL
    }
  }

  return optimizedUrl;
}

/**
 * Проверяет валидность URL изображения
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return false;
  }

  try {
    // Проверяем что это валидный URL
    new URL(url);
    return true;
  } catch {
    // Если не абсолютный URL, проверяем что это относительный путь
    return (
      url.startsWith('/') ||
      url.startsWith('./') ||
      url.startsWith('../')
    );
  }
}

/**
 * Фильтрует массив изображений, оставляя только валидные
 */
export function filterValidImages(images: (string | null | undefined)[]): string[] {
  return images.filter((img): img is string => isValidImageUrl(img));
}

/**
 * Получает лучшее доступное изображение из массива
 */
export function getBestAvailableImage(
  thumbnail: string | null | undefined,
  images: string[] = []
): string | null {
  // Сначала проверяем thumbnail
  if (isValidImageUrl(thumbnail)) {
    return thumbnail!;
  }

  // Затем ищем в массиве изображений
  const validImages = filterValidImages(images);
  return validImages.length > 0 ? validImages[0] : null;
}

/**
 * Предзагружает изображение в браузере
 */
export function preloadImage(
  src: string,
  sizeType: ImageSizeType = 'card',
  priority = false
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    // Устанавливаем приоритет
    if (priority && 'fetchPriority' in img) {
      (img as any).fetchPriority = 'high';
    }

    // Устанавливаем размеры для оптимизации
    const config = IMAGE_SIZES[sizeType];
    img.width = config.width;
    img.height = config.height;

    // Обработчики событий
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

    // Оптимизируем URL
    img.src = optimizeImageUrl(src, sizeType);
  });
}

/**
 * Предзагружает массив изображений с ограничением параллельности
 */
export async function preloadImages(
  images: string[],
  options: {
    sizeType?: ImageSizeType;
    maxConcurrent?: number;
    priority?: boolean;
    timeout?: number;
  } = {}
): Promise<{
  successful: string[];
  failed: { src: string; error: Error }[];
}> {
  const {
    sizeType = 'card',
    maxConcurrent = 3,
    priority = false,
    timeout = 10000,
  } = options;

  const validImages = filterValidImages(images);
  const successful: string[] = [];
  const failed: { src: string; error: Error }[] = [];

  // Разбиваем на чанки для ограничения параллельности
  const chunks: string[][] = [];
  for (let i = 0; i < validImages.length; i += maxConcurrent) {
    chunks.push(validImages.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(async (src) => {
      try {
        // Добавляем таймаут
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout);
        });

        await Promise.race([
          preloadImage(src, sizeType, priority),
          timeoutPromise,
        ]);

        successful.push(src);
        return { src, success: true };
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        failed.push({ src, error: err });
        return { src, success: false, error: err };
      }
    });

    await Promise.allSettled(promises);
  }

  return { successful, failed };
}

/**
 * Создает размытый placeholder для изображения
 */
export function createBlurDataURL(
  width = 8,
  height = 8,
  color = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Определяет оптимальные размеры для изображения
 */
export function calculateOptimalSizes(
  containerWidth: number,
  devicePixelRatio = 1
): string {
  const optimalWidth = Math.ceil(containerWidth * devicePixelRatio);

  // Стандартные брейкпоинты
  const breakpoints = [320, 480, 768, 1024, 1280, 1920];
  const sizes = breakpoints
    .filter(bp => bp >= optimalWidth)
    .slice(0, 3); // Берем только 3 ближайших размера

  if (sizes.length === 0) {
    sizes.push(breakpoints[breakpoints.length - 1]);
  }

  return sizes.map(size => `${size}px`).join(', ');
}

/**
 * Система кэширования изображений в памяти
 */
class ImageCache {
  private cache = new Map<string, {
    image: HTMLImageElement;
    timestamp: number;
    hits: number;
  }>();

  private maxSize = 50; // Максимум изображений в кэше
  private maxAge = 30 * 60 * 1000; // 30 минут

  set(src: string, image: HTMLImageElement): void {
    // Очищаем старые записи
    this.cleanup();

    // Если кэш полный, удаляем самую старую запись
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(src, {
      image,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  get(src: string): HTMLImageElement | null {
    const entry = this.cache.get(src);

    if (!entry) return null;

    // Проверяем не устарела ли запись
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(src);
      return null;
    }

    // Увеличиваем счетчик обращений
    entry.hits++;

    return entry.image;
  }

  has(src: string): boolean {
    return this.cache.has(src) && this.get(src) !== null;
  }

  delete(src: string): boolean {
    return this.cache.delete(src);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [src, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(src);
      }
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    const totalHits = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.hits, 0);

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }
}

// Глобальный экземпляр кэша
export const imageCache = new ImageCache();

/**
 * Lazy loading с Intersection Observer
 */
export function createImageObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
}

/**
 * Функция для генерации responsive sizes attribute
 */
export function generateResponsiveSizes(config: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
  xl?: number;
}): string {
  const {
    mobile = 100,
    tablet = 50,
    desktop = 33,
    xl = 25,
  } = config;

  return [
    `(max-width: 640px) ${mobile}vw`,
    `(max-width: 768px) ${tablet}vw`,
    `(max-width: 1024px) ${desktop}vw`,
    `${xl}vw`,
  ].join(', ');
}

/**
 * Определяет приоритет загрузки изображения
 */
export function getImagePriority(
  position: number,
  viewport: 'mobile' | 'tablet' | 'desktop' = 'desktop'
): boolean {
  const priorityLimits = {
    mobile: 2,
    tablet: 4,
    desktop: 6,
  };

  return position < priorityLimits[viewport];
}

/**
 * Создает оптимизированный srcSet для изображения
 */
export function createOptimizedSrcSet(
  src: string,
  sizeType: ImageSizeType = 'card',
  multipliers: number[] = [1, 1.5, 2, 3]
): string {
  const config = IMAGE_SIZES[sizeType];
  const loader = createImageLoader();

  return multipliers
    .map((multiplier) => {
      const width = Math.ceil(config.width * multiplier);
      const optimizedUrl = loader({
        src,
        width,
        quality: config.quality,
      });
      return `${optimizedUrl} ${multiplier}x`;
    })
    .join(', ');
}

/**
 * Утилита для работы с placeholder изображениями
 */
export const placeholderUtils = {
  /**
   * Создает SVG placeholder с размерами
   */
  createSvgPlaceholder(
    width: number,
    height: number,
    backgroundColor = '#f3f4f6',
    textColor = '#9ca3af',
    text = 'Загрузка...'
  ): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
              fill="${textColor}" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  },

  /**
   * Создает gradient placeholder
   */
  createGradientPlaceholder(
    width: number,
    height: number,
    colors = ['#f3f4f6', '#e5e7eb']
  ): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  },

  /**
   * Создает shimmer placeholder
   */
  createShimmerPlaceholder(
    width: number,
    height: number,
    baseColor = '#f3f4f6',
    shimmerColor = '#ffffff'
  ): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:${baseColor};stop-opacity:1" />
            <stop offset="50%" style="stop-color:${shimmerColor};stop-opacity:0.5" />
            <stop offset="100%" style="stop-color:${baseColor};stop-opacity:1" />
            <animateTransform attributeName="gradientTransform" type="translate"
                            values="-100 0; 100 0; -100 0" dur="2s" repeatCount="indefinite"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#shimmer)"/>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  },
};

/**
 * Функция для оптимизации изображений на лету
 */
export async function optimizeImageOnTheFly(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<Blob> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'webp',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      // Вычисляем новые размеры с сохранением пропорций
      const aspectRatio = img.width / img.height;
      let { width, height } = img;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      // Устанавливаем размеры canvas
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);

      // Рисуем изображение
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Конвертируем в нужный формат
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Утилиты для работы с метаданными изображений
 */
export const imageMetadata = {
  /**
   * Получает размеры изображения без загрузки
   */
  async getDimensions(src: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        reject(new Error(`Failed to get dimensions for: ${src}`));
      };

      img.src = src;
    });
  },

  /**
   * Проверяет формат изображения по URL
   */
  getFormat(src: string): string | null {
    const url = src.toLowerCase();

    if (url.includes('.webp') || url.includes('f=webp')) return 'webp';
    if (url.includes('.avif') || url.includes('f=avif')) return 'avif';
    if (url.includes('.jpg') || url.includes('.jpeg')) return 'jpeg';
    if (url.includes('.png')) return 'png';
    if (url.includes('.gif')) return 'gif';
    if (url.includes('.svg')) return 'svg';

    return null;
  },

  /**
   * Вычисляет aspect ratio
   */
  calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);

    return `${width / divisor}/${height / divisor}`;
  },
};

/**
 * Константы для production оптимизаций
 */
export const PRODUCTION_CONFIG = {
  // CDN настройки
  CDN_BASE_URL: process.env.NEXT_PUBLIC_CDN_URL,

  // Кэширование
  CACHE_CONTROL: {
    images: 'public, max-age=31536000, immutable',
    thumbnails: 'public, max-age=86400',
    placeholders: 'public, max-age=604800',
  },

  // Сжатие
  COMPRESSION: {
    jpeg: { quality: 85, progressive: true },
    webp: { quality: 80, lossless: false },
    avif: { quality: 75, lossless: false },
  },

  // Responsive breakpoints
  BREAKPOINTS: [320, 480, 768, 1024, 1280, 1920, 2560],

  // Lazy loading
  LAZY_LOADING: {
    rootMargin: '100px',
    threshold: 0.1,
  },
} as const;

/**
 * Главная функция для оптимизации изображений в каталоге
 */
export function optimizeProductImages(
  products: Array<{
    thumbnail?: string;
    images?: string[];
    name: string;
  }>
): Array<{
  thumbnail: string | null;
  images: string[];
  optimizedThumbnail: string | null;
  optimizedImages: string[];
  placeholderDataUrl: string;
}> {
  return products.map((product) => {
    const thumbnail = getBestAvailableImage(product.thumbnail, product.images);
    const images = filterValidImages(product.images || []);

    return {
      thumbnail,
      images,
      optimizedThumbnail: thumbnail
        ? optimizeImageUrl(thumbnail, 'card')
        : null,
      optimizedImages: images.map(img => optimizeImageUrl(img, 'gallery')),
      placeholderDataUrl: placeholderUtils.createSvgPlaceholder(
        IMAGE_SIZES.card.width,
        IMAGE_SIZES.card.height,
        '#f3f4f6',
        '#9ca3af',
        product.name
      ),
    };
  });
}

/**
 * Хелпер для Next.js Image компонента
 */
export const nextImageProps = {
  /**
   * Стандартные пропсы для карточек товаров
   */
  productCard: {
    quality: 80,
    sizes: generateResponsiveSizes({ mobile: 100, tablet: 50, desktop: 33 }),
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  },

  /**
   * Пропсы для миниатюр
   */
  thumbnail: {
    quality: 70,
    sizes: '64px',
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  },

  /**
   * Пропсы для галереи
   */
  gallery: {
    quality: 90,
    sizes: generateResponsiveSizes({ mobile: 100, tablet: 80, desktop: 60 }),
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  },

  /**
   * Пропсы для критических изображений
   */
  critical: {
    quality: 85,
    sizes: generateResponsiveSizes({ mobile: 100, tablet: 100, desktop: 100 }),
    placeholder: 'blur' as const,
    loading: 'eager' as const,
    priority: true,
  },
} as const;
