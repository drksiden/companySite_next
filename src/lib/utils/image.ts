/**
 * Утилиты для работы с изображениями
 */

// Список доменов, которые требуют unoptimized режим
const UNOPTIMIZED_DOMAINS = [
  "r2.dev",
  "pub-1506276de6ac4a07aa6fe582457507c1.r2.dev",
];

/**
 * Проверяет, нужно ли использовать unoptimized режим для изображения
 * @param src URL изображения
 * @returns true если нужен unoptimized режим
 */
export function shouldUseUnoptimized(src: string): boolean {
  if (!src) return false;

  return UNOPTIMIZED_DOMAINS.some((domain) => src.includes(domain));
}

/**
 * Проверяет, является ли URL валидным изображением
 * @param url URL для проверки
 * @returns true если URL валидный
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;

  // Проверяем базовую структуру URL
  try {
    new URL(url);
  } catch {
    return false;
  }

  // Проверяем расширения изображений
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp|avif)(\?.*)?$/i;
  return (
    imageExtensions.test(url) ||
    url.includes("images/") ||
    url.includes("media/")
  );
}

/**
 * Получает оптимальные props для Next.js Image компонента
 * @param src URL изображения
 * @param alt Альтернативный текст
 * @param priority Приоритет загрузки
 * @returns Объект с props для Image
 */
export function getImageProps(
  src: string,
  alt: string,
  priority: boolean = false,
) {
  return {
    src,
    alt,
    priority,
    unoptimized: shouldUseUnoptimized(src),
    placeholder: "blur" as const,
    blurDataURL: generateBlurDataURL(),
  };
}

/**
 * Генерирует blur placeholder для изображений
 * @param width Ширина placeholder
 * @param height Высота placeholder
 * @returns Data URL для blur placeholder
 */
export function generateBlurDataURL(
  width: number = 40,
  height: number = 40,
): string {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
}

/**
 * Получает размеры изображения для responsive loading
 * @param variant Вариант отображения
 * @returns Строка sizes для Next.js Image
 */
export function getImageSizes(
  variant: "thumbnail" | "card" | "hero" | "gallery",
): string {
  switch (variant) {
    case "thumbnail":
      return "(max-width: 768px) 64px, 96px";
    case "card":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    case "hero":
      return "100vw";
    case "gallery":
      return "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw";
    default:
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
  }
}

/**
 * Создает fallback изображение для ошибок загрузки
 * @param width Ширина изображения
 * @param height Высота изображения
 * @param text Текст для отображения
 * @returns Data URL fallback изображения
 */
export function createFallbackImage(
  width: number = 400,
  height: number = 400,
  text: string = "Изображение недоступно",
): string {
  return "/placeholder.jpg";
}

/**
 * Предзагружает изображения
 * @param urls Массив URL изображений
 * @returns Promise с результатами загрузки
 */
export async function preloadImages(urls: string[]): Promise<string[]> {
  const preloadPromises = urls.map((url) => {
    return new Promise<string>((resolve, reject) => {
      const img = new HTMLImageElement();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });

  try {
    const results = await Promise.allSettled(preloadPromises);
    return results
      .filter(
        (result): result is PromiseFulfilledResult<string> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);
  } catch (error) {
    console.error("Error preloading images:", error);
    return [];
  }
}

/**
 * Оптимизирует качество изображения в зависимости от размера
 * @param width Ширина изображения
 * @param height Высота изображения
 * @returns Рекомендуемое качество (1-100)
 */
export function getOptimalQuality(width?: number, height?: number): number {
  if (!width || !height) return 75;

  const pixels = width * height;

  // Большие изображения - меньше качество для экономии трафика
  if (pixels > 2000000) return 60; // > 2MP
  if (pixels > 1000000) return 70; // > 1MP
  if (pixels > 500000) return 80; // > 0.5MP

  return 85; // Маленькие изображения - высокое качество
}
