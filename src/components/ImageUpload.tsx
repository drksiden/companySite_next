'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface UploadedImage {
  key: string;
  url: string;
  thumbnail?: {
    key: string;
    url: string;
  };
}

interface ImageUploadProps {
  maxFiles?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  generateThumbnails?: boolean;
  maxSize?: number;
  className?: string;
}

export function ImageUpload({
  maxFiles = 5,
  onImagesChange,
  initialImages = [],
  generateThumbnails = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`Максимум ${maxFiles} изображений`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = acceptedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('generateThumbnail', generateThumbnails.toString());
        formData.append('quality', '85');
        formData.append('maxWidth', '2048');
        formData.append('maxHeight', '2048');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const result = await response.json();
        
        // Обновляем прогресс
        setUploadProgress(((index + 1) / acceptedFiles.length) * 100);
        
        return {
          key: result.file.key,
          url: result.file.url,
          thumbnail: result.thumbnail,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedImages];
      
      setImages(newImages);
      onImagesChange(newImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки изображений');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxFiles, onImagesChange, generateThumbnails]);

  const removeImage = async (index: number) => {
    const imageToRemove = images[index];
    
    try {
      // Удаляем файл с сервера
      const encodedKey = encodeURIComponent(imageToRemove.key);
      await fetch(`/api/upload/${encodedKey}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete error:', error);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxSize,
    disabled: uploading || images.length >= maxFiles
  });

  return (
    <div className={className}>
      {/* Превью загруженных изображений */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={image.key} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={image.thumbnail?.url || image.url}
                  alt={`Изображение ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Зона загрузки */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground animate-bounce" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Загрузка изображений...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive 
                    ? 'Отпустите файлы здесь' 
                    : 'Перетащите изображения сюда или нажмите для выбора'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP, GIF до {Math.round(maxSize / 1024 / 1024)}MB
                  {maxFiles > 1 && ` (максимум ${maxFiles} файлов)`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}