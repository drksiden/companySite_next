"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ProductFormData,
  Category,
  Brand,
  Collection,
  Currency,
} from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Image as ImageIcon, Trash2, Plus, Link as LinkIcon, Wand2 } from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Обновленная и исправленная схема Zod
export const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Название товара обязательно"),
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug должен содержать только строчные буквы, цифры и дефисы",
    ),
  images: z.array(z.string()).default([]).optional().nullable(),
  category_id: z.string().min(1, "Выберите категорию"),
  brand_id: z.string().optional().nullable(),
  collection_id: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  technical_description: z.string().optional().nullable(),
  base_price: z.coerce.number().min(0.01, "Цена должна быть больше 0"),
  inventory_quantity: z.coerce
    .number()
    .int()
    .min(0, "Количество не может быть отрицательным")
    .optional(),
  track_inventory: z.boolean().optional(),
  min_stock_level: z.coerce
    .number()
    .int()
    .min(0, "Уровень запаса не может быть отрицательным")
    .optional(),
  allow_backorder: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  sort_order: z.coerce
    .number()
    .int()
    .min(0, "Порядок сортировки не может быть отрицательным")
    .optional(),
  status: z.enum(["draft", "active", "archived", "out_of_stock", "made_to_order"]),
  dimensions: z
    .object({
      length: z.coerce.number().optional().nullable(),
      width: z.coerce.number().optional().nullable(),
      height: z.coerce.number().optional().nullable(),
      weight: z.coerce.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  documents: z
    .array(z.object({ url: z.string(), name: z.string(), type: z.string() }))
    .default([])
    .optional()
    .nullable(),
  specifications: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        unit: z.string().optional().nullable(),
      }),
    )
    .default([])
    .optional()
    .nullable(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  meta_keywords: z.string().optional().nullable(),
});

// Новый тип данных, выведенный напрямую из Zod схемы
export type FormData = z.infer<typeof formSchema>;

interface ProductFormProps {
  // Обновлен тип параметра, чтобы он соответствовал Zod схеме
  onSubmit: (data: FormData, imageFiles: File[], documentFiles: File[]) => void;
  initialData?: FormData;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  isSubmitting: boolean;
}

export function ProductForm({
  onSubmit,
  initialData,
  categories,
  brands,
  collections,
  isSubmitting,
}: ProductFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [documentUrls, setDocumentUrls] = useState<Array<{ url: string; name: string }>>([]);
  const [documentUrlInput, setDocumentUrlInput] = useState("");
  const [documentNameInput, setDocumentNameInput] = useState("");

  // Инициализация состояний пустыми массивами, чтобы избежать ошибок
  const [specifications, setSpecifications] = useState<
    { key: string; value: string; unit?: string | null }[]
  >([]);
  const [existingDocuments, setExistingDocuments] = useState<
    { url: string; name: string; type: string }[]
  >([]);

  // Функция для генерации мета-тегов на основе данных товара
  const generateMetaTags = () => {
    const name = form.getValues("name") || "";
    const shortDescription = form.getValues("short_description") || "";
    const description = form.getValues("description") || "";
    const brandId = form.getValues("brand_id");
    const categoryId = form.getValues("category_id");

    // Получаем названия бренда и категории
    const brand = brandId 
      ? brands.find((b) => b.id === brandId)?.name 
      : null;
    const category = categoryId 
      ? categories.find((c) => c.id === categoryId)?.name 
      : null;

    // Генерация meta_title: название + бренд (если есть) - максимум 60 символов
    let metaTitle = name;
    if (brand && metaTitle.length + brand.length + 3 <= 60) {
      metaTitle = `${name} - ${brand}`;
    }
    if (metaTitle.length > 60) {
      metaTitle = metaTitle.substring(0, 57) + "...";
    }

    // Генерация meta_description: краткое описание или первые 160 символов полного описания
    let metaDescription = shortDescription?.trim() || "";
    if (!metaDescription && description) {
      // Удаляем HTML теги из описания
      const plainDescription = description
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      metaDescription = plainDescription.substring(0, 160);
      if (plainDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + "...";
      }
    } else if (metaDescription && metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + "...";
    }

    // Генерация meta_keywords: название, бренд, категория, ключевые слова из описания
    const keywords: string[] = [];
    
    // Добавляем название (разбиваем на слова)
    if (name) {
      const nameWords = name
        .toLowerCase()
        .split(/[\s,\-]+/)
        .filter((word) => word.length > 2);
      keywords.push(...nameWords);
    }

    // Добавляем бренд
    if (brand) {
      keywords.push(brand.toLowerCase());
    }

    // Добавляем категорию
    if (category) {
      keywords.push(category.toLowerCase());
    }

    // Добавляем ключевые слова из описания (первые 5-7 значимых слов)
    if (shortDescription || description) {
      const text = ((shortDescription || description) || "")
        .replace(/<[^>]*>/g, "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3 && !["это", "для", "или", "что", "как", "где"].includes(word));
      keywords.push(...text.slice(0, 7));
    }

    // Убираем дубликаты и объединяем
    const uniqueKeywords = Array.from(new Set(keywords)).slice(0, 10);
    const metaKeywords = uniqueKeywords.join(", ");

    // Устанавливаем значения в форму
    form.setValue("meta_title", metaTitle || null);
    form.setValue("meta_description", metaDescription || null);
    form.setValue("meta_keywords", metaKeywords || null);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      images: initialData?.images ?? [],
      category_id: initialData?.category_id ?? "",
      brand_id: initialData?.brand_id ?? null,
      collection_id: initialData?.collection_id ?? null,
      short_description: initialData?.short_description ?? null,
      description: initialData?.description ?? null,
      technical_description: initialData?.technical_description ?? null,
      base_price: initialData?.base_price ?? 0.01,
      inventory_quantity: initialData?.inventory_quantity ?? 0,
      track_inventory: initialData?.track_inventory ?? true,
      min_stock_level: initialData?.min_stock_level ?? 0,
      allow_backorder: initialData?.allow_backorder ?? false,
      is_featured: initialData?.is_featured ?? false,
      is_digital: initialData?.is_digital ?? false,
      sort_order: initialData?.sort_order ?? 0,
      status: initialData?.status ?? "draft",
      dimensions: initialData?.dimensions ?? {
        length: null,
        width: null,
        height: null,
        weight: null,
      },
      specifications: initialData?.specifications ?? [],
      documents: initialData?.documents ?? [],
      meta_title: initialData?.meta_title ?? null,
      meta_description: initialData?.meta_description ?? null,
      meta_keywords: initialData?.meta_keywords ?? null,
    },
  });

  // useEffect теперь отвечает за наполнение состояний данными после монтирования
  useEffect(() => {
    if (initialData) {
      // Используем Array.isArray для надежной проверки
      setSpecifications(
        Array.isArray(initialData.specifications)
          ? initialData.specifications
          : [],
      );
      setExistingDocuments(initialData.documents || []);
      form.reset({
        ...initialData,
        images: initialData.images ?? [],
        dimensions: initialData.dimensions ?? {},
        documents: initialData.documents ?? [],
        // Убедимся, что форма получает массив, а не объект
        specifications: Array.isArray(initialData.specifications)
          ? initialData.specifications
          : [],
      });
    }
  }, [initialData, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const existingImages = form.getValues("images") || [];
    const existingCount = existingImages.length;

    if (indexToRemove < existingCount) {
      const newImages = existingImages.filter(
        (_, index) => index !== indexToRemove,
      );
      form.setValue("images", newImages);
    } else {
      const fileIndex = indexToRemove - existingCount;
      const newFiles = imageFiles.filter((_, index) => index !== fileIndex);
      setImageFiles(newFiles);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveDocument = (urlToRemove: string) => {
    const newDocuments = existingDocuments.filter(
      (doc) => doc.url !== urlToRemove,
    );
    setExistingDocuments(newDocuments);
    form.setValue("documents", newDocuments);
  };

  const handleAddDocumentUrl = () => {
    if (!documentUrlInput.trim()) {
      return;
    }
    const url = documentUrlInput.trim();
    const name = documentNameInput.trim() || `Документ ${documentUrls.length + 1}`;
    
    // Простая валидация URL
    try {
      new URL(url);
      setDocumentUrls((prev) => [...prev, { url, name }]);
      setDocumentUrlInput("");
      setDocumentNameInput("");
    } catch {
      // Если не валидный URL, все равно добавим (может быть относительный путь)
      setDocumentUrls((prev) => [...prev, { url, name }]);
      setDocumentUrlInput("");
      setDocumentNameInput("");
    }
  };

  const removeDocumentUrl = (index: number) => {
    setDocumentUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecifications([...specifications, { key: "", value: "", unit: "" }]);
  };

  const handleRemoveSpec = (indexToRemove: number) => {
    setSpecifications(
      specifications.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSpecChange = (index: number, field: string, value: string) => {
    const updatedSpecs = specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec,
    );
    setSpecifications(updatedSpecs);
  };

  const getButtonText = () => {
    if (isSubmitting) {
      return initialData?.id ? "Сохранение..." : "Создание...";
    }
    return initialData?.id ? "Сохранить изменения" : "Добавить товар";
  };

  const existingImages = form.watch("images");
  const allImages = [
    ...(existingImages || []),
    ...imageFiles.map((file) => URL.createObjectURL(file)),
  ];

  const onSubmitHandler: SubmitHandler<FormData> = (values) => {
    const filledSpecifications = specifications.filter(
      (spec) => spec.key && spec.value,
    );
    onSubmit(
      {
        ...values,
        specifications: filledSpecifications,
        documents: existingDocuments,
      },
      imageFiles,
      documentFiles,
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitHandler)} className="space-y-8">
        <Tabs defaultValue="main">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="main">Основная информация</TabsTrigger>
            <TabsTrigger value="prices">Цены и Характеристики</TabsTrigger>
            <TabsTrigger value="images">Изображения</TabsTrigger>
            <TabsTrigger value="documents">Документы</TabsTrigger>
            <TabsTrigger value="specifications">Спецификация</TabsTrigger>
            <TabsTrigger value="meta">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="main" className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название товара</FormLabel>
                  <FormControl>
                    <Input placeholder="Название" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL-идентификатор (slug)</FormLabel>
                  <FormControl>
                    <Input placeholder="url-identifikator" {...field} />
                  </FormControl>
                  <FormDescription>
                    Только строчные буквы, цифры и дефисы.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Категория</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Бренд (опционально)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите бренд" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Без бренда</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="collection_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Коллекция (опционально)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите коллекцию" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">Без коллекции</SelectItem>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Статус товара</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Черновик</SelectItem>
                      <SelectItem value="active">Активный</SelectItem>
                      <SelectItem value="archived">Архивирован</SelectItem>
                      <SelectItem value="out_of_stock">
                        Нет в наличии
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Порядок сортировки</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="prices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="99.99"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вес (кг)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.5"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dimensions.length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Длина (см)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="10"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ширина (см)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="5"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dimensions.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Высота (см)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="2"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          <TabsContent value="images" className="space-y-4">
            <Label htmlFor="image-upload">Изображения</Label>
            <Input
              id="image-upload"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {allImages.map((src, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden"
                  style={{ height: "200px" }}
                >
                  <Image
                    src={src}
                    alt={`product image ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="documents" className="space-y-4">
            <h2 className="text-xl font-semibold">Документы</h2>
            <div className="space-y-4">
              {/* Загрузка файлов */}
              <div className="space-y-2">
                <Label htmlFor="documentFiles">Загрузить новые документы (файлы)</Label>
                <Input
                  id="documentFiles"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx"
                  onChange={handleDocumentChange}
                />
              </div>

              {/* Добавление по URL */}
              <div className="space-y-2">
                <Label>Добавить документ по URL</Label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/document.pdf"
                      value={documentUrlInput}
                      onChange={(e) => setDocumentUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDocumentUrl();
                        }
                      }}
                    />
                    <Input
                      type="text"
                      placeholder="Название документа (необязательно)"
                      value={documentNameInput}
                      onChange={(e) => setDocumentNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddDocumentUrl();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddDocumentUrl}
                    disabled={!documentUrlInput.trim()}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </div>
            </div>
            {/* Существующие документы */}
            {existingDocuments.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">
                  Существующие документы:
                </h3>
                <ul className="space-y-2">
                  {existingDocuments.map((doc, index) => (
                    <li
                      key={doc.url}
                      className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800"
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex-1 truncate"
                      >
                        {doc.name}
                      </a>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveDocument(doc.url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Документы по URL */}
            {documentUrls.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium mb-2">
                  Документы по URL:
                </h3>
                <ul className="space-y-2">
                  {documentUrls.map((doc, index) => {
                    // Определяем тип файла из расширения URL
                    const getFileExtension = (url: string): string | null => {
                      try {
                        const urlObj = new URL(url);
                        const pathname = urlObj.pathname;
                        const match = pathname.match(/\.([a-z0-9]+)$/i);
                        return match ? match[1].toUpperCase() : null;
                      } catch {
                        // Если не валидный URL, пытаемся найти расширение в конце строки
                        const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
                        return match ? match[1].toUpperCase() : null;
                      }
                    };
                    
                    const fileExtension = getFileExtension(doc.url);
                    
                    return (
                      <li
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-800"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <LinkIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium truncate">{doc.name}</div>
                              {fileExtension && (
                                <Badge variant="secondary" className="text-xs">
                                  {fileExtension}
                                </Badge>
                              )}
                            </div>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-primary truncate block"
                            >
                              {doc.url}
                            </a>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeDocumentUrl(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </TabsContent>
          <TabsContent value="specifications" className="space-y-4">
            <h2 className="text-xl font-semibold">
              Технические характеристики
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Характеристика</TableHead>
                  <TableHead className="w-1/3">Значение</TableHead>
                  <TableHead className="w-1/4">Единицы измерения</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(specifications) &&
                  specifications.map((spec, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          placeholder="Например: Процессор"
                          value={spec.key}
                          onChange={(e) =>
                            handleSpecChange(index, "key", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Например: Intel Core i7"
                          value={spec.value}
                          onChange={(e) =>
                            handleSpecChange(index, "value", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Например: ГГц, ГБ"
                          value={spec.unit ?? ""}
                          onChange={(e) =>
                            handleSpecChange(index, "unit", e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveSpec(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <Button type="button" onClick={handleAddSpec}>
              <Plus className="mr-2 h-4 w-4" /> Добавить характеристику
            </Button>
          </TabsContent>
          <TabsContent value="meta" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Мета-теги</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateMetaTags}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Заполнить автоматически
              </Button>
            </div>
            <FormField
              control={form.control}
              name="meta_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Заголовок</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Заголовок для поисковых систем"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Краткое описание для поисковых систем"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meta_keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Ключевые слова</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ключевые слова через запятую"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>
      </form>
    </Form>
  );
}
