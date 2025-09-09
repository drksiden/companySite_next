import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

// Кэш для оптимизированных изображений
const imageCache = new Map<
  string,
  {
    buffer: Buffer;
    contentType: string;
    timestamp: number;
  }
>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа
const MAX_CACHE_SIZE = 100; // Максимум изображений в кэше

// Поддерживаемые форматы
const SUPPORTED_FORMATS = ["jpeg", "jpg", "png", "webp", "avif"] as const;
type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

// Стандартные размеры для каталога
const PRESET_SIZES = {
  thumbnail: { width: 300, height: 300, quality: 70 },
  card: { width: 600, height: 600, quality: 80 },
  gallery: { width: 1200, height: 1200, quality: 90 },
  fullscreen: { width: 2400, height: 2400, quality: 95 },
} as const;

interface OptimizeParams {
  src: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: SupportedFormat;
  preset?: keyof typeof PRESET_SIZES;
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Извлекаем параметры
    const params: OptimizeParams = {
      src: searchParams.get("src") || "",
      width: searchParams.get("width")
        ? parseInt(searchParams.get("width")!)
        : undefined,
      height: searchParams.get("height")
        ? parseInt(searchParams.get("height")!)
        : undefined,
      quality: searchParams.get("quality")
        ? parseInt(searchParams.get("quality")!)
        : undefined,
      format: (searchParams.get("format") as SupportedFormat) || "webp",
      preset:
        (searchParams.get("preset") as keyof typeof PRESET_SIZES) || undefined,
      fit: (searchParams.get("fit") as any) || "cover",
    };

    // Валидация параметров
    const validation = validateParams(params);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Применяем пресет если указан
    if (params.preset && PRESET_SIZES[params.preset]) {
      const preset = PRESET_SIZES[params.preset];
      params.width = params.width || preset.width;
      params.height = params.height || preset.height;
      params.quality = params.quality || preset.quality;
    }

    // Устанавливаем значения по умолчанию
    const width = params.width || 800;
    const height = params.height || 600;
    const quality = Math.min(Math.max(params.quality || 80, 10), 100);
    const format = params.format || "webp";

    // Создаем ключ кэша
    const cacheKey = `${params.src}-${width}x${height}-q${quality}-${format}-${params.fit}`;

    // Проверяем кэш
    const cached = imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new NextResponse(cached.buffer.toString("latin1"), {
        status: 200,
        headers: {
          "Content-Type": cached.contentType,
          "Cache-Control": "public, max-age=86400, immutable",
          "X-Cache": "HIT",
        },
      });
    }

    // Загружаем исходное изображение
    const sourceBuffer = await fetchSourceImage(params.src);
    if (!sourceBuffer) {
      return NextResponse.json(
        { error: "Failed to fetch source image" },
        { status: 404 }
      );
    }

    // Оптимизируем изображение
    const optimizedBuffer = await optimizeImage(sourceBuffer, {
      width,
      height,
      quality,
      format,
      fit: params.fit || "cover",
    });

    const contentType = `image/${format}`;

    // Сохраняем в кэш
    cleanupCache();
    imageCache.set(cacheKey, {
      buffer: optimizedBuffer,
      contentType,
      timestamp: Date.now(),
    });

    // Возвращаем оптимизированное изображение
    return new NextResponse(optimizedBuffer.toString("latin1"), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
        "X-Cache": "MISS",
        "X-Original-Size": sourceBuffer.length.toString(),
        "X-Optimized-Size": optimizedBuffer.length.toString(),
        "X-Compression-Ratio":
          ((1 - optimizedBuffer.length / sourceBuffer.length) * 100).toFixed(
            2
          ) + "%",
      },
    });
  } catch (error) {
    console.error("Image optimization error:", error);

    return NextResponse.json(
      {
        error: "Image optimization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Валидация параметров
function validateParams(params: OptimizeParams): {
  valid: boolean;
  error?: string;
} {
  if (!params.src) {
    return { valid: false, error: "Source URL is required" };
  }

  // Проверяем URL
  try {
    new URL(params.src);
  } catch {
    // Проверяем относительный путь
    if (!params.src.startsWith("/")) {
      return { valid: false, error: "Invalid source URL" };
    }
  }

  // Проверяем размеры
  if (params.width && (params.width < 1 || params.width > 4000)) {
    return { valid: false, error: "Width must be between 1 and 4000 pixels" };
  }

  if (params.height && (params.height < 1 || params.height > 4000)) {
    return { valid: false, error: "Height must be between 1 and 4000 pixels" };
  }

  // Проверяем качество
  if (params.quality && (params.quality < 1 || params.quality > 100)) {
    return { valid: false, error: "Quality must be between 1 and 100" };
  }

  // Проверяем формат
  if (params.format && !SUPPORTED_FORMATS.includes(params.format)) {
    return {
      valid: false,
      error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
    };
  }

  return { valid: true };
}

// Загрузка исходного изображения
async function fetchSourceImage(src: string): Promise<Buffer | null> {
  try {
    let imageUrl: string;

    // Если это относительный путь, делаем его абсолютным
    if (src.startsWith("/")) {
      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      imageUrl = `${baseUrl}${src}`;
    } else {
      imageUrl = src;
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "NextJS-Image-Optimizer/1.0",
      },
      // Таймаут 10 секунд
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch image: ${response.status} ${response.statusText}`
      );
      return null;
    }

    // Проверяем content-type
    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      console.error(`Invalid content type: ${contentType}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error fetching source image:", error);
    return null;
  }
}

// Оптимизация изображения с помощью Sharp
async function optimizeImage(
  buffer: Buffer,
  options: {
    width: number;
    height: number;
    quality: number;
    format: SupportedFormat;
    fit: "cover" | "contain" | "fill" | "inside" | "outside";
  }
): Promise<Buffer> {
  const { width, height, quality, format, fit } = options;

  let sharpInstance = sharp(buffer);

  // Изменяем размер
  sharpInstance = sharpInstance.resize(width, height, {
    fit: fit,
    withoutEnlargement: true,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  });

  // Применяем оптимизации в зависимости от формата
  switch (format) {
    case "jpeg":
    case "jpg":
      sharpInstance = sharpInstance.jpeg({
        quality,
        progressive: true,
        mozjpeg: true,
      });
      break;

    case "png":
      sharpInstance = sharpInstance.png({
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
      break;

    case "webp":
      sharpInstance = sharpInstance.webp({
        quality,
        effort: 6,
        smartSubsample: true,
      });
      break;

    case "avif":
      sharpInstance = sharpInstance.avif({
        quality,
        effort: 9,
        chromaSubsampling: "4:2:0",
      });
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  // Применяем дополнительные оптимизации
  sharpInstance = sharpInstance.sharpen().normalize();

  return await sharpInstance.toBuffer();
}

// Очистка кэша
function cleanupCache(): void {
  if (imageCache.size < MAX_CACHE_SIZE) return;

  const now = Date.now();
  const entries = Array.from(imageCache.entries());

  // Удаляем устаревшие записи
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_TTL) {
      imageCache.delete(key);
    }
  });

  // Если кэш всё ещё полный, удаляем самые старые записи
  if (imageCache.size >= MAX_CACHE_SIZE) {
    const sortedEntries = entries
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(MAX_CACHE_SIZE * 0.3)); // Удаляем 30% самых старых

    sortedEntries.forEach(([key]) => {
      imageCache.delete(key);
    });
  }
}

// POST endpoint для batch оптимизации
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, options } = body;

    if (!Array.isArray(images)) {
      return NextResponse.json(
        { error: "Images array is required" },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images per batch request" },
        { status: 400 }
      );
    }

    const results = [];

    for (const imageRequest of images) {
      try {
        const params: OptimizeParams = {
          src: imageRequest.src,
          width: imageRequest.width || options?.width,
          height: imageRequest.height || options?.height,
          quality: imageRequest.quality || options?.quality,
          format: imageRequest.format || options?.format || "webp",
          preset: imageRequest.preset || options?.preset,
          fit: imageRequest.fit || options?.fit || "cover",
        };

        const validation = validateParams(params);
        if (!validation.valid) {
          results.push({
            src: params.src,
            success: false,
            error: validation.error,
          });
          continue;
        }

        // Создаем URL для оптимизированного изображения
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const optimizedUrl = new URL("/api/images/optimize", baseUrl);

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            optimizedUrl.searchParams.set(key, value.toString());
          }
        });

        results.push({
          src: params.src,
          optimizedUrl: optimizedUrl.toString(),
          success: true,
        });
      } catch (error) {
        results.push({
          src: imageRequest.src,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      processed: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
  } catch (error) {
    console.error("Batch optimization error:", error);

    return NextResponse.json(
      {
        error: "Batch optimization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// OPTIONS для CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
