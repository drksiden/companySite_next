import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/cloudflare-r2';
import sharp from 'sharp';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface UploadOptions {
  generateThumbnail?: boolean;
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  watermark?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const options: UploadOptions = {
      generateThumbnail: formData.get('generateThumbnail') === 'true',
      quality: parseInt(formData.get('quality') as string) || 85,
      maxWidth: parseInt(formData.get('maxWidth') as string) || 2048,
      maxHeight: parseInt(formData.get('maxHeight') as string) || 2048,
      watermark: formData.get('watermark') === 'true',
    };

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', success: false },
        { status: 400 }
      );
    }

    // Валидация типа файла
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', success: false },
        { status: 400 }
      );
    }

    // Валидация размера файла
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.', success: false },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Обработка изображения с помощью Sharp
    let processedBuffer = buffer;
    let finalContentType = file.type;

    if (file.type.startsWith('image/')) {
      const image = sharp(buffer);
      
      // Получаем метаданные изображения
      const metadata = await image.metadata();
      
      // Изменяем размер если нужно
      if (metadata.width && metadata.width > options.maxWidth! || 
          metadata.height && metadata.height > options.maxHeight!) {
        image.resize(options.maxWidth, options.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      // Конвертируем в WebP для лучшего сжатия
      if (file.type !== 'image/gif') {
        processedBuffer = await image
          .webp({ quality: options.quality })
          .toBuffer();
        finalContentType = 'image/webp';
      } else {
        // Для GIF сохраняем оригинальный формат
        processedBuffer = await image.toBuffer();
      }
    }

    // Генерируем ключ файла
    const originalKey = r2Client.generateFileKey(file.name);
    const fileKey = finalContentType === 'image/webp' 
      ? originalKey.replace(/\.[^/.]+$/, '.webp')
      : originalKey;

    // Загружаем основное изображение
    const uploadResult = await r2Client.uploadFile(
      fileKey,
      processedBuffer,
      finalContentType,
      {
        originalName: file.name,
        originalSize: file.size.toString(),
        uploadedAt: new Date().toISOString(),
      }
    );

    const response: any = {
      success: true,
      file: {
        key: uploadResult.key,
        url: uploadResult.url,
        filename: file.name,
        size: processedBuffer.length,
        contentType: finalContentType,
        uploadedAt: new Date().toISOString(),
      },
    };

    // Генерируем миниатюру если требуется
    if (options.generateThumbnail && file.type.startsWith('image/')) {
      try {
        const thumbnailBuffer = await sharp(buffer)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();

        const thumbnailKey = fileKey.replace(/\.[^/.]+$/, '_thumb.webp');
        const thumbnailResult = await r2Client.uploadFile(
          thumbnailKey,
          thumbnailBuffer,
          'image/webp'
        );

        response.thumbnail = {
          key: thumbnailResult.key,
          url: thumbnailResult.url,
        };
      } catch (error) {
        console.warn('Failed to generate thumbnail:', error);
      }
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}