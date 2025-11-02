"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Loader2,
  Image as ImageIcon,
  Trash2,
  Plus,
  Upload,
  X,
  FileText,
  File,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SimpleHtmlEditor } from "@/components/ui/simple-html-editor";
import Image from "next/image";

// Zod schema для формы новости
const newsSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Заголовок обязателен"),
  description: z.string().min(1, "Краткое описание обязательно"),
  content: z.string().optional(),
  date: z.string().min(1, "Дата обязательна"),
  category: z.string().min(1, "Категория обязательна"),
  author: z.string().optional(),
  is_active: z.boolean().optional().default(true),
});

export type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  onSubmit: (data: globalThis.FormData) => void;
  initialData?: any;
  isSubmitting: boolean;
}

export function NewsFormNew({
  onSubmit,
  initialData,
  isSubmitting,
}: NewsFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<
    Array<{ url: string; name: string; type: string }>
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      content: initialData?.content ?? "",
      date: initialData?.date
        ? new Date(initialData.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      category: initialData?.category ?? "",
      author: initialData?.author ?? "",
      is_active: initialData?.is_active ?? true,
    },
  });

  // Инициализация данных
  useEffect(() => {
    if (initialData) {
      if (initialData.images && Array.isArray(initialData.images)) {
        setExistingImages(initialData.images);
      }
      if (initialData.tags && Array.isArray(initialData.tags)) {
        setTags(initialData.tags);
      }
      if (initialData.documents && Array.isArray(initialData.documents)) {
        setExistingDocuments(
          initialData.documents.map((doc: any) => ({
            url: typeof doc === "string" ? doc : doc.url || doc,
            name: doc.name || "Документ",
            type: doc.type || "application/pdf",
          }))
        );
      }
    }
  }, [initialData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );
    setImageFiles((prev) => [...prev, ...imageFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles((prev) => [...prev, ...files]);
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDocumentFile = (index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingDocument = (index: number) => {
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleSubmit: SubmitHandler<NewsFormData> = (data) => {
    const formData = new FormData();

    // Добавляем поля формы
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    // Добавляем теги
    formData.append("tags", JSON.stringify(tags));

    // Добавляем файлы изображений
    imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    // Добавляем файлы документов
    documentFiles.forEach((file) => {
      formData.append("documentFiles", file);
    });

    // Добавляем существующие изображения
    if (initialData?.id) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    // Добавляем существующие документы
    if (initialData?.id && existingDocuments.length > 0) {
      formData.append(
        "existingDocuments",
        JSON.stringify(existingDocuments.map((d) => d.url))
      );
    }

    onSubmit(formData);
  };

  // Не нужно объединять, так как мы отображаем их отдельно

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="main" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="main">Основное</TabsTrigger>
              <TabsTrigger value="content">Содержание</TabsTrigger>
              <TabsTrigger value="images">Изображения</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
            </TabsList>
          </div>

          {/* Основная информация */}
          <TabsContent value="main" className="space-y-4 px-6 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Введите заголовок новости" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Краткое описание *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Краткое описание новости (отображается в списке)"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Дата публикации *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Например: Продукция, Новости компании"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Автор</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Например: Техническая служба"
                    />
                  </FormControl>
                  <FormDescription>
                    Имя автора статьи (необязательно)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Теги */}
            <div className="space-y-2">
              <Label>Теги</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Добавить тег и нажать Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Активна</FormLabel>
                    <FormDescription>
                      Показывать новость на сайте
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Содержание */}
          <TabsContent value="content" className="space-y-4 px-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Полный текст новости (HTML)</FormLabel>
                  <FormControl>
                    <SimpleHtmlEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Введите полный текст новости..."
                      rows={20}
                    />
                  </FormControl>
                  <FormDescription>
                    Используйте HTML редактор для форматирования текста
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Изображения */}
          <TabsContent value="images" className="space-y-4 px-6">
            <div className="space-y-2">
              <Label>Загрузить изображения</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Выбрать
                </Button>
              </div>
            </div>

            {(existingImages.length > 0 || imageFiles.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {/* Существующие изображения */}
                {existingImages.map((src, index) => (
                  <div
                    key={`existing-${index}`}
                    className="relative group aspect-square rounded-md overflow-hidden border"
                  >
                    <Image
                      src={src}
                      alt={`Existing image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Новые изображения */}
                {imageFiles.map((file, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group aspect-square rounded-md overflow-hidden border"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`New image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="text-xs">
                        Новое
                      </Badge>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Документы */}
          <TabsContent value="documents" className="space-y-4 px-6">
            <div className="space-y-2">
              <Label>Загрузить документы</Label>
              <div className="flex gap-2">
                <Input
                  ref={documentInputRef}
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="cursor-pointer"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => documentInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Выбрать
                </Button>
              </div>
            </div>

            {/* Существующие документы */}
            {existingDocuments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Существующие документы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExistingDocument(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Новые документы */}
            {documentFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Новые документы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocumentFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t px-6 pb-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : initialData?.id ? (
              "Обновить"
            ) : (
              "Создать"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

