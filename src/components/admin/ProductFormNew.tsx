"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Loader2,
  Image as ImageIcon,
  Trash2,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Zod schema для формы продукта
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Название товара обязательно"),
  slug: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  short_description: z.string().optional(),
  description: z.string().optional(),
  technical_description: z.string().optional(),
  category_id: z.string().min(1, "Выберите категорию"),
  brand_id: z.string().optional().or(z.literal("no-brand")),
  collection_id: z.string().optional().or(z.literal("no-collection")),
  base_price: z.coerce.number().min(0.01, "Цена должна быть больше 0"),
  sale_price: z.coerce.number().optional(),
  cost_price: z.coerce.number().optional(),
  currency_id: z.string().optional(),
  track_inventory: z.boolean().optional().default(true),
  inventory_quantity: z.coerce.number().int().min(0).optional().default(0),
  min_stock_level: z.coerce.number().int().min(0).optional().default(0),
  allow_backorder: z.boolean().optional().default(false),
  weight: z.coerce.number().optional(),
  dimensions: z
    .object({
      length: z.coerce.number().optional(),
      width: z.coerce.number().optional(),
      height: z.coerce.number().optional(),
    })
    .optional(),
  status: z
    .enum(["draft", "active", "archived", "out_of_stock"])
    .optional()
    .default("draft"),
  is_featured: z.boolean().optional().default(false),
  is_digital: z.boolean().optional().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

interface ProductFormProps {
  onSubmit: (data: globalThis.FormData) => void;
  initialData?: any;
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  currencies: Currency[];
  isSubmitting: boolean;
}

export function ProductFormNew({
  onSubmit,
  initialData,
  categories,
  brands,
  collections,
  currencies,
  isSubmitting,
}: ProductFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);

  const form = useForm<ProductFormData>({
    // resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      barcode: "",
      short_description: "",
      description: "",
      technical_description: "",
      category_id: "",
      brand_id: "no-brand",
      collection_id: "no-collection",
      base_price: 0,
      sale_price: 0,
      cost_price: 0,
      currency_id: currencies.find((c) => c.code === "KZT")?.id || "",
      track_inventory: true,
      inventory_quantity: 0,
      min_stock_level: 0,
      allow_backorder: false,
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      status: "draft",
      is_featured: false,
      is_digital: false,
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      sort_order: 0,
    },
  });

  // Загружаем данные при редактировании
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        dimensions: {
          length: initialData.dimensions?.length || 0,
          width: initialData.dimensions?.width || 0,
          height: initialData.dimensions?.height || 0,
        },
        brand_id: initialData.brand_id || "no-brand",
        collection_id: initialData.collection_id || "no-collection",
        // Обрабатываем null значения для строковых полей
        sku: initialData.sku || "",
        barcode: initialData.barcode || "",
        short_description: initialData.short_description || "",
        description: initialData.description || "",
        technical_description: initialData.technical_description || "",
        meta_title: initialData.meta_title || "",
        meta_description: initialData.meta_description || "",
        meta_keywords: initialData.meta_keywords || "",
        thumbnail: initialData.thumbnail || "",
        // Обрабатываем null значения для числовых полей
        weight: initialData.weight || 0,
        sale_price: initialData.sale_price || 0,
        cost_price: initialData.cost_price || 0,
      });

      setExistingImages(initialData.images || []);
      setExistingDocuments(initialData.documents || []);
      setSpecifications(
        Object.entries(initialData.specifications || {}).map(
          ([key, value]) => ({
            key,
            value: String(value),
          }),
        ),
      );
    }
  }, [initialData, form]);

  // Автогенерация slug из названия
  const handleNameChange = (value: string) => {
    if (!initialData?.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", slug);
    }
  };

  // Обработка загрузки изображений
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  // Обработка загрузки документов
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  // Удаление изображения
  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Удаление документа
  const removeDocument = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Добавление спецификации
  const addSpecification = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  // Удаление спецификации
  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Обновление спецификации
  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)),
    );
  };

  const handleSubmit: SubmitHandler<ProductFormData> = (data) => {
    // Простая валидация
    if (!data.name || data.name.trim().length === 0) {
      form.setError("name", { message: "Название товара обязательно" });
      return;
    }
    if (!data.category_id || data.category_id.trim().length === 0) {
      form.setError("category_id", { message: "Выберите категорию" });
      return;
    }
    if (!data.base_price || data.base_price <= 0) {
      form.setError("base_price", { message: "Цена должна быть больше 0" });
      return;
    }

    const formData = new FormData();

    // Обрабатываем специальные значения
    const processedData = { ...data };
    if (processedData.brand_id === "no-brand") {
      processedData.brand_id = undefined;
    }
    if (processedData.collection_id === "no-collection") {
      processedData.collection_id = undefined;
    }

    // Добавляем все поля формы
    Object.entries(processedData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "dimensions") {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === "boolean") {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Добавляем спецификации
    const specsObject = specifications.reduce(
      (acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      },
      {} as Record<string, string>,
    );
    formData.append("specifications", JSON.stringify(specsObject));

    // Добавляем файлы изображений
    imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    // Добавляем файлы документов
    documentFiles.forEach((file) => {
      formData.append("documentFiles", file);
    });

    // Добавляем существующие изображения и документы только при редактировании
    if (initialData?.id) {
      formData.append("existingImages", JSON.stringify(existingImages));
      formData.append("existingDocuments", JSON.stringify(existingDocuments));
    }

    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Основное</TabsTrigger>
            <TabsTrigger value="pricing">Цены</TabsTrigger>
            <TabsTrigger value="inventory">Склад</TabsTrigger>
            <TabsTrigger value="media">Медиа</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
                <CardDescription>Основные данные о товаре</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название товара</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL (slug)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Артикул (SKU)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {"—".repeat(category.level)} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Бренд</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите бренд" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-brand">Без бренда</SelectItem>
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
                        <FormLabel>Коллекция</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите коллекцию" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-collection">
                              Без коллекции
                            </SelectItem>
                            {collections.map((collection) => (
                              <SelectItem
                                key={collection.id}
                                value={collection.id}
                              >
                                {collection.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Краткое описание</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
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
                      <FormLabel>Описание</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="technical_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Техническое описание</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Статус</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Черновик</SelectItem>
                            <SelectItem value="active">Активный</SelectItem>
                            <SelectItem value="archived">
                              Архивирован
                            </SelectItem>
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
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Рекомендуемый товар</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_digital"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Цифровой товар</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Спецификации */}
            <Card>
              <CardHeader>
                <CardTitle>Спецификации</CardTitle>
                <CardDescription>
                  Технические характеристики товара
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Название характеристики"
                        value={spec.key}
                        onChange={(e) =>
                          updateSpecification(index, "key", e.target.value)
                        }
                      />
                      <Input
                        placeholder="Значение"
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecification(index, "value", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSpecification(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSpecification}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить характеристику
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ценообразование</CardTitle>
                <CardDescription>Настройка цен и валюты</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="currency_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Валюта</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.code} - {currency.name} (
                              {currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="base_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Базовая цена</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sale_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Цена со скидкой</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Себестоимость</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Управление складом</CardTitle>
                <CardDescription>Настройка складских остатков</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="track_inventory"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Отслеживать остатки на складе</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inventory_quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество на складе</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="min_stock_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Минимальный уровень запаса</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allow_backorder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Разрешить предзаказы</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Вес (г)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dimensions.length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Длина (мм)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
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
                        <FormLabel>Ширина (мм)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
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
                        <FormLabel>Высота (мм)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Изображения</CardTitle>
                <CardDescription>Загрузите изображения товара</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Изображение ${index + 1}`}
                          width={150}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index, true)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Новое изображение ${index + 1}`}
                          width={150}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeImage(index, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="images">Добавить изображения</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Документы</CardTitle>
                <CardDescription>
                  Загрузите документы и файлы товара
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {existingDocuments.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <span className="flex-1">{doc.name}</span>
                        <Badge variant="secondary">{doc.type}</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index, true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {documentFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <span className="flex-1">{file.name}</span>
                        <Badge variant="secondary">{file.type}</Badge>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeDocument(index, false)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="documents">Добавить документы</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO настройки</CardTitle>
                <CardDescription>
                  Настройка метаданных для поисковых систем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="meta_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta заголовок</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="SEO заголовок страницы"
                        />
                      </FormControl>
                      <FormDescription>
                        Рекомендуемая длина: 50-60 символов
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta описание</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="SEO описание страницы"
                        />
                      </FormControl>
                      <FormDescription>
                        Рекомендуемая длина: 150-160 символов
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meta_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ключевые слова</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="ключевое слово 1, ключевое слово 2, ..."
                        />
                      </FormControl>
                      <FormDescription>
                        Разделяйте ключевые слова запятыми
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Сбросить
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Обновление..." : "Создание..."}
              </>
            ) : initialData ? (
              "Обновить товар"
            ) : (
              "Создать товар"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
