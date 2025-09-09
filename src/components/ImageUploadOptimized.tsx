'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Eye, Download } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedImage {
  key: string;
  url: string;
  thumbnail?: {
    key: string;
    url: string;
  };
  metadata?: {
    size: number;
    type: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

interface ImageUploadOptimizedProps {
  maxFiles?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  generateThumbnails?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  variant?: 'grid' | 'list' | 'compact';
  showPreview?: boolean;
  showMetadata?: boolean;
  enableReordering?: boolean;
  watermark?: boolean;
}

interface UploadProgress {
  total: number;
  completed: number;
  current?: {
    fileName: string;
    progress: number;
  };
}

export function ImageUploadOptimized({
  maxFiles = 5,
  onImagesChange,
  initialImages = [],
  generateThumbnails = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  quality = 85,
  maxWidth = 2048,
  maxHeight = 2048,
  className,
  variant = 'grid',
  showPreview = true,
  showMetadata = false,
  enableReordering = false,
  watermark = false,
}: ImageUploadOptimizedProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    total: 0,
    completed: 0,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<UploadedImage | null>(null);

  // Мемоизированные значения
  const canUploadMore = useMemo(() => images.length < maxFiles, [images.length, maxFiles]);
  const totalSize = useMemo(() =>
    images.reduce((sum, img) => sum + (img.metadata?.size || 0), 0),
    [images]
  );
  const formattedTotalSize = useMemo(() =>
    (totalSize / (1024 * 1024)).toFixed(2),
    [totalSize]
  );

  // Обработка загрузки файлов
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!canUploadMore) {
      toast.error(`Максимум ${maxFiles} изображений`);
      return;
    }

    const filesToUpload = acceptedFiles.slice(0, maxFiles - images.length);
    if (filesToUpload.length !== acceptedFiles.length) {
      toast.warning(`Загружено только ${filesToUpload.length} из ${acceptedFiles.length} файлов`);
    }

    setUploading(true);
    setErrors([]);
    setUploadProgress({
      total: filesToUpload.length,
      completed: 0,
    });

    const uploadedImages: UploadedImage[] = [];
    const uploadErrors: string[] = [];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        setUploadProgress(prev => ({
          ...prev,
          current: {
            fileName: file.name,
            progress: 0,
          },
        }));

        try {
          // Валидация файла
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`Неподдерживаемый тип файла: ${file.type}`);
          }

          if (file.size > maxSize) {
            throw new Error(`Файл слишком большой: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
          }

          // Создаем FormData для загрузки
          const formData = new FormData();
          formData.append('file', file);
          formData.append('generateThumbnail', generateThumbnails.toString());
          formData.append('quality', quality.toString());
          formData.append('maxWidth', maxWidth.toString());
          formData.append('maxHeight', maxHeight.toString());
          formData.append('watermark', watermark.toString());

          // Загружаем файл с прогрессом
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка загрузки');
          }

          const result = await response.json();

          // Получаем метаданные изображения
          const img = new window.Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });

          const uploadedImage: UploadedImage = {
            key: result.file.key,
            url: result.file.url,
            thumbnail: result.thumbnail,
            metadata: {
              size: file.size,
              type: file.type,
              dimensions: {
                width: img.width,
                height: img.height,
              },
            },
          };

          uploadedImages.push(uploadedImage);

          // Освобождаем URL объекта
          URL.revokeObjectURL(img.src);

          setUploadProgress(prev => ({
            ...prev,
            completed: prev.completed + 1,
            current: {
              fileName: file.name,
              progress: 100,
            },
          }));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          uploadErrors.push(`${file.name}: ${errorMessage}`);
          console.error('Upload error:', error);
        }
      }

      // Обновляем состояние
      const newImages = [...images, ...uploadedImages];
      setImages(newImages);
      onImagesChange(newImages);

      if (uploadErrors.length > 0) {
        setErrors(uploadErrors);
        toast.error(`Ошибки при загрузке ${uploadErrors.length} файлов`);
      } else {
        toast.success(`Успешно загружено ${uploadedImages.length} изображений`);
      }

    } catch (error) {
      console.error('Upload process error:', error);
      toast.error('Критическая ошибка при загрузке');
    } finally {
      setUploading(false);
      setUploadProgress({ total: 0, completed: 0 });
    }
  }, [
    images,
    maxFiles,
    canUploadMore,
    allowedTypes,
    maxSize,
    generateThumbnails,
    quality,
    maxWidth,
    maxHeight,
    watermark,
    onImagesChange,
  ]);

  // Удаление изображения
  const removeImage = useCallback(async (index: number) => {
    const imageToRemove = images[index];

    try {
      // Удаляем файл с сервера
      const encodedKey = encodeURIComponent(imageToRemove.key);
      const response = await fetch(`/api/upload/${encodedKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        console.warn('Failed to delete file from server');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
    toast.success('Изображение удалено');
  }, [images, onImagesChange]);

  // Перестановка изображений
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    if (!enableReordering) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setImages(newImages);
    onImagesChange(newImages);
  }, [images, enableReordering, onImagesChange]);

  // Настройки dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    disabled: uploading || !canUploadMore,
    multiple: maxFiles > 1,
  });

  // Рендер прогресса загрузки
  const renderUploadProgress = () => {
    if (!uploading) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка изображений...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {uploadProgress.completed} из {uploadProgress.total}
                </span>
                <span>
                  {Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%
                </span>
              </div>
              <Progress
                value={(uploadProgress.completed / uploadProgress.total) * 100}
                className="h-2"
              />
              {uploadProgress.current && (
                <div className="text-xs text-muted-foreground">
                  {uploadProgress.current.fileName}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Рендер ошибок
  const renderErrors = () => {
    if (errors.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Ошибки загрузки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-destructive">
                  {error}
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setErrors([])}
            >
              Закрыть
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Рендер превью изображений
  const renderImagePreview = () => {
    if (images.length === 0) return null;

    const gridClasses = cn(
      "grid gap-4",
      variant === 'grid' && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      variant === 'list' && "grid-cols-1",
      variant === 'compact' && "grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
    );

    return (
      <div className={gridClasses}>
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              <Card className="overflow-hidden">
                <div className={cn(
                  "relative bg-muted",
                  variant === 'compact' ? "aspect-square" : "aspect-[4/3]"
                )}>
                  <Image
                    src={image.thumbnail?.url || image.url}
                    alt={`Изображение ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Оверлей с действиями */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {showPreview && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 w-7 p-0"
                          onClick={() => setPreviewImage(image)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 w-7 p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Индикатор успешной загрузки */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Загружено
                    </Badge>
                  </div>
                </div>

                {/* Метаданные */}
                {showMetadata && image.metadata && variant !== 'compact' && (
                  <CardContent className="p-2">
                    <div className="text-xs text-muted-foreground space-y-1">
                      {image.metadata.dimensions && (
                        <div>
                          {image.metadata.dimensions.width} × {image.metadata.dimensions.height}
                        </div>
                      )}
                      <div>
                        {(image.metadata.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Рендер зоны загрузки
  const renderDropzone = () => {
    if (!canUploadMore) return null;

    return (
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
          uploading && "pointer-events-none opacity-50",
          className
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>

          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Отпустите файлы здесь'
                : 'Перетащите изображения сюда или нажмите для выбора'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} до {Math.round(maxSize / 1024 / 1024)}MB
              {maxFiles > 1 && ` (максимум ${maxFiles - images.length} файлов)`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Статистика
  const renderStats = () => {
    if (images.length === 0) return null;

    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <span>
          {images.length} из {maxFiles} изображений
        </span>
        <span>
          Общий размер: {formattedTotalSize} MB
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {renderUploadProgress()}
        {renderErrors()}
      </AnimatePresence>

      {renderStats()}
      {renderImagePreview()}
      {renderDropzone()}

      {/* Модальное окно превью */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center p-4">
            <Image
              src={previewImage.url}
              alt="Превью изображения"
              fill
              className="object-contain"
              quality={100}
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4"
              onClick={() => setPreviewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploadOptimized;
