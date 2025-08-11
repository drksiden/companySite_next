/**
 * Простая утилита для работы с изображениями
 * Заменяет проблемный useImagePreloader
 */

export interface ImageLoadResult {
  loaded: boolean;
  error: boolean;
  src: string;
}

/**
 * Простая функция для предзагрузки изображения
 */
export const preloadImage = (src: string): Promise<ImageLoadResult> => {
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

    // Устанавливаем таймаут
    setTimeout(() => {
      resolve({ loaded: false, error: true, src });
    }, 10000);

    img.src = src;
  });
};

/**
 * Получить первое доступное изображение из массива
 */
export const getFirstValidImage = (images: (string | null | undefined)[]): string => {
  const validImage = images.find(img =>
    img &&
    typeof img === 'string' &&
    img.trim() !== '' &&
    !img.includes('undefined') &&
    !img.includes('null')
  );

  return validImage || '/placeholder.jpg';
};

/**
 * Проверить, является ли URL изображения валидным
 */
export const isValidImageUrl = (url: string | null | undefined): url is string => {
  return Boolean(
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    !url.includes('undefined') &&
    !url.includes('null') &&
    (url.startsWith('http') || url.startsWith('/'))
  );
};

/**
 * Получить оптимизированный src для изображения
 */
export const getOptimizedImageSrc = (
  src: string | null | undefined,
  fallback = '/placeholder.jpg'
): string => {
  if (!isValidImageUrl(src)) {
    return fallback;
  }

  // Для внешних URL возвращаем как есть
  if (src.startsWith('http')) {
    return src;
  }

  // Для локальных путей проверяем, что они начинаются с /
  return src.startsWith('/') ? src : `/${src}`;
};

/**
 * Создать sizes строку для Next.js Image
 */
export const createImageSizes = (breakpoints: Record<string, string>): string => {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ');
};

/**
 * Стандартные sizes для разных типов изображений
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
