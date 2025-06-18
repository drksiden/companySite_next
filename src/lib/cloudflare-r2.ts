import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class CloudflareR2Client {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
    this.publicUrl = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN || process.env.CLOUDFLARE_R2_PUBLIC_URL!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    });

    if (!this.bucketName || !this.publicUrl) {
      throw new Error('Missing Cloudflare R2 configuration');
    }
  }

  /**
   * Загрузка файла в R2
   */
  async uploadFile(
    key: string,
    file: Buffer | Uint8Array | string,
    contentType: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: contentType,
          Metadata: metadata,
          // Делаем файл публично доступным
          ACL: 'public-read',
        })
      );

      const url = `${this.publicUrl}/${key}`;
      return { url, key };
    } catch (error) {
      console.error('Error uploading file to R2:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Удаление файла из R2
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      console.error('Error deleting file from R2:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Получение подписанного URL для приватных файлов
   */
  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Получение публичного URL
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /**
   * Генерация уникального ключа для файла
   */
  generateFileKey(originalName: string, prefix = 'products'): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    
    return `${prefix}/${timestamp}_${randomString}_${sanitizedName}`;
  }
}

export const r2Client = new CloudflareR2Client();