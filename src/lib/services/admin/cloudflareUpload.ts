// lib/services/cloudflareUpload.ts

export interface UploadedFileMeta {
  url: string;
  name: string;
  type: string;
}

/**
 * Загружает файлы на Cloudflare R2/S3 через pre-signed URLs, возвращает массив публичных ссылок.
 * @param files Массив файлов (File[])
 * @param folder string (например "images" или "documents")
 * @returns [{ url, name, type }]
 */
export async function uploadToCloudflareS3(
  files: File[],
  folder: string
): Promise<UploadedFileMeta[]> {
  const results: UploadedFileMeta[] = [];
  for (const file of files) {
    // Получи pre-signed PUT/upload URL с backend
    const res = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, folder, type: file.type }),
    });
    if (!res.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, publicUrl } = await res.json();

    // Загрузи файл напрямую на storage через полученный uploadUrl
    const putRes = await fetch(uploadUrl, { method: 'PUT', body: file });
    if (!putRes.ok) throw new Error('Failed to upload file');

    results.push({ url: publicUrl, name: file.name, type: file.type });
  }
  return results;
}
