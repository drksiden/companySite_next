import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Environment variables
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const R2_PUBLIC_BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const R2_PUBLIC_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_PUBLIC_BUCKET ||
  !R2_PUBLIC_BASE_URL
) {
  console.error("Missing R2 environment variables:", {
    R2_ACCOUNT_ID: !!R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: !!R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: !!R2_SECRET_ACCESS_KEY,
    R2_PUBLIC_BUCKET: !!R2_PUBLIC_BUCKET,
    R2_PUBLIC_BASE_URL: !!R2_PUBLIC_BASE_URL,
  });
  throw new Error("Missing required R2 environment variables");
}

// Create S3 client for Cloudflare R2
export const r2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Create a presigned PUT URL for uploading files directly to R2
 */
export async function createPresignedPutURL({
  bucket,
  key,
  contentType,
  expiresIn = 60 * 5, // 5 minutes default
}: {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Upload a file buffer directly to R2
 */
export async function uploadFileToR2Buffer({
  bucket,
  key,
  buffer,
  contentType,
  metadata,
}: {
  bucket: string;
  key: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<{ url: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: metadata,
  });

  await r2.send(command);

  const url = getPublicUrl(key);
  return { url, key };
}

/**
 * Legacy function: Upload a File object directly to R2
 * @param file - File object from FormData
 * @param folder - Folder path (e.g., "images/products")
 * @returns Public URL of uploaded file
 */
export async function uploadFileToR2(
  file: File,
  folder: string,
): Promise<string> {
  // Convert File to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique key
  const key = generateFileKey({
    originalName: file.name,
    folder,
  });

  // Upload to R2
  const result = await uploadFileToR2Buffer({
    bucket: DEFAULT_BUCKET,
    key,
    buffer,
    contentType: file.type,
  });

  return result.url;
}

/**
 * Delete a file from R2 (supports both URL and object parameters)
 */
export async function deleteFileFromR2(
  urlOrParams: string | { bucket: string; key: string },
): Promise<void> {
  let bucket: string;
  let key: string;

  if (typeof urlOrParams === "string") {
    // Legacy mode: extract key from URL
    const extractedKey = extractKeyFromUrl(urlOrParams);
    if (!extractedKey) {
      throw new Error(`Cannot extract key from URL: ${urlOrParams}`);
    }
    bucket = DEFAULT_BUCKET;
    key = extractedKey;
  } else {
    // New mode: use provided bucket and key
    bucket = urlOrParams.bucket;
    key = urlOrParams.key;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await r2.send(command);
}

/**
 * Delete multiple files from R2 (supports both URL array and object parameters)
 */
export async function deleteMultipleFilesFromR2(
  urlsOrParams: string[] | { bucket: string; keys: string[] },
): Promise<void> {
  if (Array.isArray(urlsOrParams)) {
    // Legacy mode: array of URLs - filter out null/undefined values
    const validUrls = urlsOrParams.filter(
      (url): url is string =>
        url != null && typeof url === "string" && url.trim() !== "",
    );
    const deletePromises = validUrls.map((url) => {
      const key = extractKeyFromUrl(url);
      if (!key) throw new Error(`Cannot extract key from URL: ${url}`);
      return deleteFileFromR2({ bucket: DEFAULT_BUCKET, key });
    });
    await Promise.all(deletePromises);
  } else {
    // New mode: bucket and keys object
    const deletePromises = urlsOrParams.keys.map((key) =>
      deleteFileFromR2({ bucket: urlsOrParams.bucket, key }),
    );
    await Promise.all(deletePromises);
  }
}

/**
 * Generate a unique file key for R2 storage
 */
export function generateFileKey({
  originalName,
  folder = "images",
}: {
  originalName: string;
  folder?: string;
}): string {
  const uuid = crypto.randomUUID();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Extract extension
  const ext = originalName.split(".").pop()?.toLowerCase() || "";

  // Sanitize filename
  const sanitized = originalName
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50);

  return `${folder}/${year}/${month}/${day}/${uuid}_${sanitized}.${ext}`;
}

/**
 * Get public URL for a file key
 */
export function getPublicUrl(key: string): string {
  const baseUrl = R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return `${baseUrl}/${key}`;
}

/**
 * Extract R2 key from public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const baseUrl = R2_PUBLIC_BASE_URL.replace(/\/$/, "");
    if (!url.startsWith(baseUrl)) {
      return null;
    }

    return url.substring(baseUrl.length + 1);
  } catch {
    return null;
  }
}

/**
 * Validate file type for images
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",
  ];
  const validExtensions = ["jpg", "jpeg", "png", "webp", "avif", "gif"];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only images are allowed.",
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !validExtensions.includes(extension)) {
    return { valid: false, error: "Invalid file extension." };
  }

  const maxSize = Number(process.env.R2_UPLOAD_MAX_MB ?? 20) * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file type for documents
 */
export function validateDocumentFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ];
  const validExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt", "csv"];

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only documents are allowed.",
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !validExtensions.includes(extension)) {
    return { valid: false, error: "Invalid file extension." };
  }

  const maxSize = 50 * 1024 * 1024; // 50MB for documents
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is 50MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validate if URL is from our R2 bucket
 */
export function isValidR2Url(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  const baseUrl = R2_PUBLIC_BASE_URL.replace(/\/$/, "");
  return url.startsWith(baseUrl);
}

// Default bucket and max upload size
export const DEFAULT_BUCKET = R2_PUBLIC_BUCKET;
export const MAX_UPLOAD_SIZE_MB = Number(process.env.R2_UPLOAD_MAX_MB ?? 20);
