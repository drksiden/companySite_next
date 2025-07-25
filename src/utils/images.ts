/**
 * Утилиты для работы с изображениями
 */

/**
 * Проверяет, является ли URL валидным изображением
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Получает правильный URL для изображения
 */
export function getImageUrl(thumbnail?: string): string | null {
  if (!thumbnail) return null;

  // Если URL уже полный, возвращаем как есть
  if (thumbnail.startsWith("http://") || thumbnail.startsWith("https://")) {
    return thumbnail;
  }

  // Если это относительный путь, возвращаем как есть
  if (thumbnail.startsWith("/")) {
    return thumbnail;
  }

  // Если это ключ файла, формируем URL для CDN
  return `/api/files/${encodeURIComponent(thumbnail)}`;
}

/**
 * Получает placeholder URL для изображения
 */
export function getPlaceholderImageUrl(width = 400, height = 400): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
            fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
        Нет изображения
      </text>
    </svg>
  `)}`;
}

/**
 * Генерирует blur data URL для placeholder
 */
export function getBlurDataURL(): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
}

/**
 * Получает оптимизированный URL изображения с параметрами
 */
export function getOptimizedImageUrl(
  thumbnail?: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string | null {
  const baseUrl = getImageUrl(thumbnail);
  if (!baseUrl) return null;

  // Если это внешний URL, возвращаем как есть
  if (baseUrl.startsWith("http")) {
    return baseUrl;
  }

  // Добавляем параметры оптимизации для внутренних URL
  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Проверяет, поддерживает ли браузер формат WebP
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Получает размеры изображения
 */
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
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
 * Преобразует File в base64 string
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
 * Проверяет, является ли файл изображением
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Получает допустимые форматы изображений
 */
export function getAcceptedImageFormats(): string[] {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
}

/**
 * Проверяет размер файла изображения
 */
export function validateImageSize(file: File, maxSizeInMB = 10): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}
