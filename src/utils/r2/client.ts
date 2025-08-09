import { r2Client as cloudflareR2Client } from "@/lib/cloudflare-r2";

// Типы для папок в R2 с более детальной структурой
export type R2Folder =
  | "images/products"
  | "images/categories"
  | "images/brands"
  | "images/collections"
  | "images/users"
  | "images/avatars"
  | "documents/products"
  | "documents/categories"
  | "documents/legal"
  | "documents/manuals"
  | "specifications/products"
  | "specifications/technical"
  | "temp";

/**
 * Загружает файл в R2 с указанием папки
 * @param file - Файл для загрузки
 * @param folder - Папка назначения
 * @returns URL загруженного файла
 */
export async function uploadFileToR2(
  file: File,
  folder: R2Folder,
): Promise<string> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50);

  const fileName = `${folder}/${timestamp}_${randomString}_${sanitizedName}`;

  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);

  const result = await cloudflareR2Client.uploadFile(
    fileName,
    buffer,
    file.type,
    {
      originalName: file.name,
      originalSize: file.size.toString(),
      uploadedAt: new Date().toISOString(),
    },
  );

  return result.url;
}

/**
 * Извлекает ключ объекта из публичного URL
 * @param fileUrl - Публичный URL файла
 * @returns Ключ объекта или null если URL невалидный
 */
export function extractR2KeyFromUrl(
  fileUrl: string | null | undefined,
): string | null {
  if (!fileUrl || typeof fileUrl !== "string") {
    return null;
  }

  try {
    const publicUrl =
      process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN ||
      process.env.CLOUDFLARE_R2_PUBLIC_URL;
    if (!publicUrl) {
      console.error("R2 public URL environment variable is not set");
      return null;
    }

    // Убираем слэш в конце если есть
    const baseUrl = publicUrl.endsWith("/")
      ? publicUrl.slice(0, -1)
      : publicUrl;

    if (!fileUrl.startsWith(baseUrl)) {
      console.warn(
        `File URL does not match expected base URL. Expected: ${baseUrl}, Got: ${fileUrl}`,
      );
      return null;
    }

    // Извлекаем ключ после базового URL
    const key = fileUrl.substring(baseUrl.length + 1); // +1 для слэша
    return key || null;
  } catch (error) {
    console.error("Error extracting R2 key from URL:", error);
    return null;
  }
}

/**
 * Удаляет файл из R2 по публичному URL
 * @param fileUrl - Публичный URL файла для удаления
 */
export async function deleteFileFromR2(
  fileUrl: string | null | undefined,
): Promise<void> {
  const key = extractR2KeyFromUrl(fileUrl);

  if (!key) {
    console.warn("Invalid URL provided to deleteFileFromR2. Skipping.");
    return;
  }

  try {
    await cloudflareR2Client.deleteFile(key);
    console.log(`Successfully deleted object with key: ${key}`);
  } catch (error) {
    console.error(`Error deleting object with key: ${key}`, error);
    // Не выбрасываем ошибку, так как файл может уже не существовать
  }
}

/**
 * Удаляет массив файлов из R2
 * @param fileUrls - Массив публичных URL файлов для удаления
 */
export async function deleteMultipleFilesFromR2(
  fileUrls: (string | null | undefined)[],
): Promise<void> {
  const deletePromises = fileUrls
    .filter((url): url is string => Boolean(url))
    .map((url) => deleteFileFromR2(url));

  await Promise.allSettled(deletePromises);
}

/**
 * Валидирует, что URL принадлежит нашему R2 bucket
 * @param fileUrl - URL для проверки
 * @returns true если URL валидный
 */
export function isValidR2Url(fileUrl: string | null | undefined): boolean {
  if (!fileUrl || typeof fileUrl !== "string") {
    return false;
  }

  const publicUrl =
    process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN ||
    process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!publicUrl) {
    return false;
  }

  const baseUrl = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  return fileUrl.startsWith(baseUrl);
}

/**
 * Получает публичный URL по ключу файла
 * @param key - Ключ файла в R2
 * @returns Публичный URL
 */
export function getPublicUrlFromKey(key: string): string {
  return cloudflareR2Client.getPublicUrl(key);
}

/**
 * Генерирует ключ файла для определенной папки
 * @param originalName - Оригинальное имя файла
 * @param folder - Папка назначения
 * @returns Сгенерированный ключ
 */
export function generateFileKey(
  originalName: string,
  folder: R2Folder,
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50);

  return `${folder}/${timestamp}_${randomString}_${sanitizedName}`;
}

/**
 * Загружает буфер файла в R2
 * @param buffer - Буфер файла
 * @param contentType - MIME тип
 * @param folder - Папка назначения
 * @param originalName - Оригинальное имя файла
 * @returns URL загруженного файла
 */
export async function uploadBufferToR2(
  buffer: Buffer,
  contentType: string,
  folder: R2Folder,
  originalName: string,
): Promise<string> {
  const fileName = generateFileKey(originalName, folder);

  const result = await cloudflareR2Client.uploadFile(
    fileName,
    buffer,
    contentType,
    {
      originalName,
      originalSize: buffer.length.toString(),
      uploadedAt: new Date().toISOString(),
    },
  );

  return result.url;
}

// Экспортируем существующий клиент для прямого использования при необходимости
export { cloudflareR2Client as r2Client };
