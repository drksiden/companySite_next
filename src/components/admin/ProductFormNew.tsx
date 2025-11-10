"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
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
  FileText,
  File,
  Download,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Heading1,
  Minus,
  Link as LinkIcon,
  Wand2,
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
  onClose?: () => void;
  onCloseAttempt?: () => boolean;
}

export function ProductFormNew({
  onSubmit,
  initialData,
  categories,
  brands,
  collections,
  currencies,
  isSubmitting,
  onClose,
  onCloseAttempt,
}: ProductFormProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  
  // Структура строк спецификации (технических данных)
  interface SpecificationRow {
    id: string;
    type: "header" | "row" | "separator";
    key?: string; // для типа "row"
    value?: string; // для типа "row", может быть HTML
  }
  
  const [specifications, setSpecifications] = useState<SpecificationRow[]>([]);
  const [specificationsDescription, setSpecificationsDescription] = useState<string>("");

  // Новая структура документов с группами
  interface DocumentItem {
    id: string;
    title: string;
    url?: string;
    file?: File;
    description?: string;
    size?: number;
    type?: string;
  }

  interface DocumentGroup {
    id: string;
    title: string;
    documents: DocumentItem[];
  }

  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);

  // Ключ для localStorage
  const storageKey = `product-form-draft-${initialData?.id || 'new'}`;
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isSubmittingRef = useRef(false);

  // Функция для генерации мета-тегов на основе данных товара
  const generateMetaTags = () => {
    const name = form.getValues("name") || "";
    const shortDescription = form.getValues("short_description") || "";
    const description = form.getValues("description") || "";
    const brandId = form.getValues("brand_id");
    const categoryId = form.getValues("category_id");

    // Получаем названия бренда и категории
    const brand = brandId && brandId !== "no-brand" 
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
    let metaDescription = shortDescription.trim();
    if (!metaDescription) {
      // Удаляем HTML теги из описания
      const plainDescription = description
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      metaDescription = plainDescription.substring(0, 160);
      if (plainDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + "...";
      }
    } else if (metaDescription.length > 160) {
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
      const text = (shortDescription || description)
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
    form.setValue("meta_title", metaTitle);
    form.setValue("meta_description", metaDescription);
    form.setValue("meta_keywords", metaKeywords);
  };

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

  // Загружаем данные при редактировании - стабилизированная версия
  const initialDataIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialData && initialData.id !== initialDataIdRef.current) {
      initialDataIdRef.current = initialData.id;

      // Извлекаем ID из связанных объектов, если они есть
      const categoryId = initialData.category_id || 
                        (initialData.category as any)?.id || 
                        "";
      const brandId = initialData.brand_id || 
                     (initialData.brand as any)?.id || 
                     null;
      const collectionId = initialData.collection_id || 
                          (initialData.collection as any)?.id || 
                          null;
      const currencyId = initialData.currency_id || 
                        (initialData.currency as any)?.id || 
                        null;

      // Преобразуем все ID в строки для корректной работы Select компонентов
      const formValues = {
        ...initialData,
        // Категория - обязательное поле, должно быть строкой
        category_id: categoryId ? String(categoryId) : "",
        // Статус - должен быть строкой из enum
        status: (initialData.status as string) || "draft",
        // Бренд и коллекция - могут быть null, заменяем на спец. значения
        brand_id: brandId ? String(brandId) : "no-brand",
        collection_id: collectionId ? String(collectionId) : "no-collection",
        // Валюта - преобразуем в строку
        currency_id: currencyId ? String(currencyId) : (currencies.find((c) => c.code === "KZT")?.id || ""),
        dimensions: {
          length: initialData.dimensions?.length || 0,
          width: initialData.dimensions?.width || 0,
          height: initialData.dimensions?.height || 0,
        },
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
      };

      form.reset(formValues);
      
      // Принудительно устанавливаем значения для Select компонентов после небольшой задержки
      // Это гарантирует, что компоненты уже отрендерены и готовы к обновлению
      setTimeout(() => {
        // Устанавливаем категорию
        const finalCategoryId = categoryId ? String(categoryId) : "";
        if (finalCategoryId) {
          form.setValue("category_id", finalCategoryId, { 
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false 
          });
        }
        
        // Устанавливаем статус
        const finalStatus = (initialData.status as string) || "draft";
        form.setValue("status", finalStatus as any, { 
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false 
        });
        
        // Устанавливаем бренд
        const finalBrandId = brandId ? String(brandId) : "no-brand";
        form.setValue("brand_id", finalBrandId, { 
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false 
        });
        
        // Устанавливаем коллекцию
        const finalCollectionId = collectionId ? String(collectionId) : "no-collection";
        form.setValue("collection_id", finalCollectionId, { 
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false 
        });
        
        // Устанавливаем валюту
        const finalCurrencyId = currencyId ? String(currencyId) : (currencies.find((c) => c.code === "KZT")?.id || "");
        if (finalCurrencyId) {
          form.setValue("currency_id", finalCurrencyId, { 
            shouldValidate: false,
            shouldDirty: false,
            shouldTouch: false 
          });
        }
      }, 50);

      setExistingImages(initialData.images || []);
      
      // Загружаем технические характеристики (specifications)
      if (initialData.specifications) {
        try {
          // specifications может быть объектом { rows: [...], description: "..." } или просто объектом
          let specsData: any = initialData.specifications;
          
          // Если это строка, парсим JSON
          if (typeof specsData === 'string') {
            specsData = JSON.parse(specsData);
          }
          
          // Если это объект с полями rows и description
          if (specsData && typeof specsData === 'object') {
            if (specsData.rows && Array.isArray(specsData.rows)) {
              // Преобразуем в формат SpecificationRow с id и type
              const specsRows: SpecificationRow[] = specsData.rows.map((row: any, index: number) => {
                // Если у строки уже есть type, используем его, иначе определяем по наличию key/value
                const type = row.type || (row.key !== undefined ? "row" : "header");
                return {
                  id: row.id || `spec-${Date.now()}-${index}`,
                  type: type as "header" | "row" | "separator",
                  key: row.key || "",
                  value: row.value || "",
                };
              });
              setSpecifications(specsRows);
            } else if (Array.isArray(specsData)) {
              // Если это массив напрямую
              const specsRows: SpecificationRow[] = specsData.map((row: any, index: number) => {
                const type = row.type || (row.key !== undefined ? "row" : "header");
                return {
                  id: row.id || `spec-${Date.now()}-${index}`,
                  type: type as "header" | "row" | "separator",
                  key: row.key || "",
                  value: row.value || "",
                };
              });
              setSpecifications(specsRows);
            }
            
            if (specsData.description) {
              setSpecificationsDescription(specsData.description);
            }
          }
        } catch (error) {
          console.error("Error loading specifications:", error);
        }
      }
      
      // Загружаем документы (documents)
      if (initialData.documents) {
        try {
          let docsData: any = initialData.documents;
          
          // Если это строка, парсим JSON
          if (typeof docsData === 'string') {
            docsData = JSON.parse(docsData);
          }
          
          // documents может быть массивом групп или массивом документов (старый формат)
          if (docsData && Array.isArray(docsData)) {
            // Проверяем, это новый формат (группы) или старый (просто документы)
            if (docsData.length > 0 && docsData[0].title && docsData[0].documents) {
              // Новый формат: массив групп
              const groups: DocumentGroup[] = docsData.map((group: any, groupIndex: number) => ({
                id: group.id || `group-${Date.now()}-${groupIndex}`,
                title: group.title || "Без названия",
                documents: (group.documents || []).map((doc: any, docIndex: number) => ({
                  id: doc.id || `doc-${Date.now()}-${groupIndex}-${docIndex}`,
                  title: doc.title || doc.name || "",
                  url: doc.url || "",
                  description: doc.description || "",
                  size: doc.size || "",
                  type: doc.type || "",
                })),
              }));
              setDocumentGroups(groups);
            } else {
              // Старый формат: массив документов, преобразуем в группы
              const defaultGroup: DocumentGroup = {
                id: `group-${Date.now()}`,
                title: "Документы",
                documents: docsData.map((doc: any, index: number) => ({
                  id: doc.id || `doc-${Date.now()}-${index}`,
                  title: doc.title || doc.name || "",
                  url: doc.url || "",
                  description: doc.description || "",
                  size: doc.size || "",
                  type: doc.type || "",
                })),
              };
              setDocumentGroups([defaultGroup]);
            }
          }
        } catch (error) {
          console.error("Error loading documents:", error);
        }
      }
      
      // Восстановление данных из localStorage при монтировании (только для новых товаров)
    } else {
      // Восстанавливаем данные только для новых товаров
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          // Проверяем, не слишком ли старые данные (более 7 дней)
          if (parsed.timestamp && Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
            // Восстанавливаем только текстовые поля, не файлы
            const { specifications: savedSpecs, documentGroups: savedDocs, timestamp, ...formData } = parsed;
            
            if (savedSpecs) setSpecifications(savedSpecs);
            if (savedDocs) setDocumentGroups(savedDocs);
            
            // Восстанавливаем значения формы
            setTimeout(() => {
              Object.entries(formData).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "" && key !== 'timestamp') {
                  form.setValue(key as any, value, { shouldDirty: false });
                }
              });
            }, 100);
          } else {
            // Удаляем устаревшие данные
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]); // Только при изменении initialData

  // Отслеживаем изменения формы для автосохранения
  const formValues = useWatch({ control: form.control });
  
  // Автосохранение в localStorage
  useEffect(() => {
    if (isSubmittingRef.current || initialData?.id) return; // Не сохраняем во время отправки и для редактирования
    
    // Не сохраняем сразу после загрузки (первые 2 секунды)
    const timeoutId = setTimeout(() => {
      if (formValues && Object.keys(formValues).length > 0) {
        try {
          const dataToSave = {
            ...formValues,
            specifications: specifications,
            documentGroups: documentGroups,
            existingImages: existingImages,
            timestamp: Date.now(),
          };
          
          // Удаляем пустые значения
          const cleanedData = Object.fromEntries(
            Object.entries(dataToSave).filter(([_, v]) => v !== null && v !== undefined && v !== "")
          );
          
          localStorage.setItem(storageKey, JSON.stringify(cleanedData));
          setHasUnsavedChanges(true);
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }
    }, 2000); // Задержка 2 секунды для дебаунса

    return () => clearTimeout(timeoutId);
  }, [formValues, specifications, documentGroups, existingImages, storageKey, initialData?.id]);

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

  // Удаление изображения
  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Работа с группами документов
  const addDocumentGroup = () => {
    const newGroup: DocumentGroup = {
      id: `group-${Date.now()}`,
      title: "Новая группа",
      documents: [],
    };
    setDocumentGroups((prev) => [...prev, newGroup]);
  };

  const removeDocumentGroup = (groupId: string) => {
    setDocumentGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const updateDocumentGroupTitle = (groupId: string, title: string) => {
    setDocumentGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title } : g))
    );
  };

  const addDocumentToGroup = (groupId: string, file?: File) => {
    // Определяем MIME-тип по расширению, если file.type пустой
    const getMimeType = (fileName: string, defaultType?: string): string => {
      if (defaultType && defaultType.trim()) {
        return defaultType;
      }
      const ext = fileName.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain',
        rtf: 'application/rtf',
        odt: 'application/vnd.oasis.opendocument.text',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        odp: 'application/vnd.oasis.opendocument.presentation',
      };
      return ext && mimeTypes[ext] ? mimeTypes[ext] : 'application/pdf';
    };
    
    const fileType = file ? getMimeType(file.name, file.type) : undefined;
    
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random()}`,
      title: file?.name || "Новый документ",
      file,
      size: file?.size,
      type: fileType,
    };
    setDocumentGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, documents: [...g.documents, newDoc] }
          : g
      )
    );
  };

  const removeDocumentFromGroup = (groupId: string, docId: string) => {
    setDocumentGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, documents: g.documents.filter((d) => d.id !== docId) }
          : g
      )
    );
  };

  const updateDocument = (
    groupId: string,
    docId: string,
    updates: Partial<DocumentItem>
  ) => {
    setDocumentGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              documents: g.documents.map((d) =>
                d.id === docId ? { ...d, ...updates } : d
              ),
            }
          : g
      )
    );
  };

  // Добавление строки спецификации
  const addSpecificationRow = (type: "header" | "row" | "separator" = "row") => {
    const newRow: SpecificationRow = {
      id: `spec-${Date.now()}-${Math.random()}`,
      type,
      ...(type === "row" ? { key: "", value: "" } : {}),
      ...(type === "header" ? { key: "" } : {}),
    };
    setSpecifications((prev) => [...prev, newRow]);
  };

  // Удаление строки спецификации
  const removeSpecification = (id: string) => {
    setSpecifications((prev) => prev.filter((spec) => spec.id !== id));
  };

  // Обновление строки спецификации
  const updateSpecification = (id: string, updates: Partial<SpecificationRow>) => {
    setSpecifications((prev) =>
      prev.map((spec) => (spec.id === id ? { ...spec, ...updates } : spec))
    );
  };

  // Перемещение строки вверх/вниз
  const moveSpecification = (id: string, direction: "up" | "down") => {
    setSpecifications((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newSpecs = [...prev];
      [newSpecs[index], newSpecs[newIndex]] = [newSpecs[newIndex], newSpecs[index]];
      return newSpecs;
    });
  };

  const handleSubmit: SubmitHandler<ProductFormData> = (data) => {
    isSubmittingRef.current = true;
    
    // Простая валидация
    if (!data.name || data.name.trim().length === 0) {
      form.setError("name", { message: "Название товара обязательно" });
      isSubmittingRef.current = false;
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

    // Добавляем спецификации (технические данные) как массив строк
    const specificationsData = {
      rows: specifications,
      description: specificationsDescription,
    };
    formData.append("specifications", JSON.stringify(specificationsData));

    // Добавляем файлы изображений
    imageFiles.forEach((file) => {
      formData.append("imageFiles", file);
    });

    // Добавляем документы с группами
    // Собираем все файлы для загрузки
    const documentFilesToUpload: File[] = [];
    documentGroups.forEach((group) => {
      group.documents.forEach((doc) => {
        if (doc.file) {
          documentFilesToUpload.push(doc.file);
        }
      });
    });
    
    documentFilesToUpload.forEach((file) => {
      formData.append("documentFiles", file);
    });

    // Сохраняем структуру документов (без файлов, только метаданные)
    // Важно: для новых файлов сохраняем тип из файла, чтобы правильно сопоставить после загрузки
    const documentsStructure = documentGroups.map((group) => ({
      title: group.title,
      documents: group.documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        url: doc.url, // для существующих документов
        description: doc.description,
        size: doc.size || doc.file?.size,
        // Для новых файлов сохраняем тип из файла, для существующих - из doc.type
        type: doc.file ? (doc.file.type || doc.type) : doc.type,
        // Добавляем имя файла для сопоставления
        fileName: doc.file?.name,
      })),
    }));
    formData.append("documentsStructure", JSON.stringify(documentsStructure));

    // Добавляем существующие изображения только при редактировании
    if (initialData?.id) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }

    // Очищаем автосохранение после успешной отправки
    localStorage.removeItem(storageKey);
    setHasUnsavedChanges(false);
    
    onSubmit(formData);
    
    // Сбрасываем флаг после небольшой задержки
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 1000);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full flex flex-col"
        data-unsaved-changes={hasUnsavedChanges ? "true" : undefined}
      >
        <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
          <div className="px-6 pt-0 pb-4 border-b bg-background sticky top-0 z-10">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="general">Основное</TabsTrigger>
              <TabsTrigger value="pricing">Цены</TabsTrigger>
              <TabsTrigger value="inventory">Склад</TabsTrigger>
              <TabsTrigger value="media">Медиа</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <TabsContent value="general" className="space-y-4 mt-0">
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
                    render={({ field }) => {
                      // Убеждаемся, что value это строка и существует в списке категорий
                      const categoryValue = field.value ? String(field.value) : "";
                      const isValidCategory = categories.some(c => String(c.id) === categoryValue);
                      const displayValue = isValidCategory ? categoryValue : "";
                      
                      return (
                        <FormItem>
                          <FormLabel>Категория</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={displayValue}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                  {"—".repeat(category.level)} {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand_id"
                      render={({ field }) => {
                        // Убеждаемся, что value это строка
                        const brandValue = field.value ? String(field.value) : "no-brand";
                        const isValidBrand = brandValue === "no-brand" || brands.some(b => String(b.id) === brandValue);
                        const displayValue = isValidBrand ? brandValue : "no-brand";
                        
                        return (
                          <FormItem>
                            <FormLabel>Бренд</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={displayValue}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите бренд" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="no-brand">
                                  Без бренда
                                </SelectItem>
                                {brands.map((brand) => (
                                  <SelectItem key={brand.id} value={String(brand.id)}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />

                    <FormField
                      control={form.control}
                      name="collection_id"
                      render={({ field }) => {
                        // Убеждаемся, что value это строка
                        const collectionValue = field.value ? String(field.value) : "no-collection";
                        const isValidCollection = collectionValue === "no-collection" || collections.some(c => String(c.id) === collectionValue);
                        const displayValue = isValidCollection ? collectionValue : "no-collection";
                        
                        return (
                          <FormItem>
                            <FormLabel>Коллекция</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={displayValue}
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
                                    value={String(collection.id)}
                                  >
                                    {collection.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <SimpleHtmlEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Введите описание товара... Используйте кнопки форматирования для заголовков (h1, h2, h3), списков и т.д."
                              rows={12}
                            />
                          </FormControl>
                          <FormDescription>
                            Используйте HTML-форматирование для структурирования описания
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="technical_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Дополнительная информация</FormLabel>
                          <FormControl>
                            <SimpleHtmlEditor
                              value={field.value || ""}
                              onChange={field.onChange}
                              placeholder="Дополнительная техническая информация о товаре... Используйте кнопки форматирования для структурирования текста."
                              rows={12}
                            />
                          </FormControl>
                          <FormDescription>
                            Дополнительные сведения и технические детали. Используйте HTML-форматирование для структурирования информации.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => {
                        // Убеждаемся, что value это строка и валидное значение статуса
                        const statusValue = field.value ? String(field.value) : "draft";
                        const validStatuses = ["draft", "active", "archived", "out_of_stock"];
                        const displayValue = validStatuses.includes(statusValue) ? statusValue : "draft";
                        
                        return (
                          <FormItem>
                            <FormLabel>Статус</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={displayValue}
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
                        );
                      }}
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

              {/* Спецификации - Технические данные */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Технические данные</CardTitle>
                      <CardDescription>
                        Создайте редактируемую таблицу с подтаблицами. Используйте заголовки для группировки параметров.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSpecificationRow("header")}
                      >
                        <Heading1 className="h-4 w-4 mr-2" />
                        Заголовок
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSpecificationRow("row")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Строка
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSpecificationRow("separator")}
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Разделитель
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {specifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Нет технических данных. Добавьте заголовок или строку для начала.</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="w-1/2 p-2 text-left font-semibold border-r">Параметр</th>
                            <th className="w-1/2 p-2 text-left font-semibold">Значение</th>
                            <th className="w-24 p-2 text-center font-semibold border-l">Действия</th>
                          </tr>
                        </thead>
                        <tbody>
                          {specifications.map((spec, index) => {
                            if (spec.type === "separator") {
                              return (
                                <tr key={spec.id} className="border-t">
                                  <td colSpan={3} className="p-2">
                                    <div className="flex items-center justify-center py-2">
                                      <div className="flex-1 border-t"></div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="mx-2 h-6 w-6 p-0"
                                        onClick={() => removeSpecification(spec.id)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            if (spec.type === "header") {
                              return (
                                <tr key={spec.id} className="bg-muted/30 border-t">
                                  <td colSpan={3} className="p-3">
                                    <div className="flex items-center gap-2">
                                      <Input
                                        value={spec.key || ""}
                                        onChange={(e) =>
                                          updateSpecification(spec.id, { key: e.target.value })
                                        }
                                        placeholder="Название подтаблицы (например: Параметры радиоканала)"
                                        className="font-semibold text-base h-auto py-1"
                                      />
                                      <div className="flex gap-1">
                                        {index > 0 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => moveSpecification(spec.id, "up")}
                                          >
                                            <ArrowUp className="h-4 w-4" />
                                          </Button>
                                        )}
                                        {index < specifications.length - 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => moveSpecification(spec.id, "down")}
                                          >
                                            <ArrowDown className="h-4 w-4" />
                                          </Button>
                                        )}
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive"
                                          onClick={() => removeSpecification(spec.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            // Обычная строка (row)
                            return (
                              <tr key={spec.id} className="border-t hover:bg-muted/20">
                                <td className="p-2 border-r">
                                  <Input
                                    value={spec.key || ""}
                                    onChange={(e) =>
                                      updateSpecification(spec.id, { key: e.target.value })
                                    }
                                    placeholder="Название параметра"
                                    className="border-0 bg-transparent focus:bg-background"
                                  />
                                </td>
                                <td className="p-2">
                                  <Textarea
                                    value={spec.value || ""}
                                    onChange={(e) =>
                                      updateSpecification(spec.id, { value: e.target.value })
                                    }
                                    placeholder="Значение параметра (можно использовать HTML: <strong>, <em>, <ul>, <ol>, и т.д.)"
                                    rows={2}
                                    className="min-h-[60px] text-sm resize-none"
                                  />
                                </td>
                                <td className="p-2 border-l">
                                  <div className="flex justify-center gap-1">
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => moveSpecification(spec.id, "up")}
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {index < specifications.length - 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => moveSpecification(spec.id, "down")}
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-destructive"
                                      onClick={() => removeSpecification(spec.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* HTML описание для спецификаций */}
                  <div className="mt-6 space-y-2">
                    <Label>Дополнительное описание к характеристикам</Label>
                    <SimpleHtmlEditor
                      value={specificationsDescription}
                      onChange={setSpecificationsDescription}
                      placeholder="Дополнительная информация о технических характеристиках (можно использовать HTML форматирование)..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Используйте это поле для добавления дополнительного текстового описания к характеристикам.
                    </p>
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
                    render={({ field }) => {
                      // Убеждаемся, что value это строка и существует в списке валют
                      const currencyValue = field.value ? String(field.value) : "";
                      const isValidCurrency = currencies.some(c => String(c.id) === currencyValue);
                      const defaultCurrencyId = currencies.find((c) => c.code === "KZT")?.id || "";
                      const displayValue = isValidCurrency ? currencyValue : (defaultCurrencyId ? String(defaultCurrencyId) : "");
                      
                      return (
                        <FormItem>
                          <FormLabel>Валюта</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={displayValue}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.id} value={String(currency.id)}>
                                  {currency.code} - {currency.name} (
                                  {currency.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
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
                  <CardDescription>
                    Настройка складских остатков
                  </CardDescription>
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
                  <CardDescription>
                    Загрузите изображения товара
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Изображение ${index + 1}`}
                            className="w-[150px] h-[150px] rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik03NSA0MEM2OC4zNzMzIDQwIDYzIDQ1LjM3MzMgNjMgNTJDNjMgNTguNjI2NyA2OC4zNzMzIDY0IDc1IDY0QzgxLjYyNjcgNjQgODcgNTguNjI2NyA4NyA1MkM4NyA0NS4zNzMzIDgxLjYyNjcgNDAgNzUgNDBaIiBmaWxsPSIjQTFBMUFBIi8+CjxwYXRoIGQ9Ik00MCA4MEwyNSAxMDBIMTI1TDEwMCA3MEw4MCA5MEw0MCA4MFoiIGZpbGw9IiNBMUExQUEiLz4KPC9zdmc+";
                            }}
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
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Новое изображение ${index + 1}`}
                            className="w-[150px] h-[150px] rounded-lg object-cover"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Документы</CardTitle>
                      <CardDescription>
                        Организуйте документы по группам с заголовками и описаниями
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addDocumentGroup}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить группу
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {documentGroups.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Нет документов. Добавьте группу для начала работы.</p>
                      </div>
                    ) : (
                      documentGroups.map((group) => (
                        <Card key={group.id} className="border-2">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-4">
                              <Input
                                value={group.title}
                                onChange={(e) =>
                                  updateDocumentGroupTitle(group.id, e.target.value)
                                }
                                placeholder="Название группы (например: Сертификаты)"
                                className="font-semibold text-lg h-auto py-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeDocumentGroup(group.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {group.documents.length === 0 ? (
                              <div className="text-center py-4 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                Нет документов в этой группе
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {group.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="p-4 border rounded-lg bg-muted/30 space-y-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <FileText className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={doc.title}
                                            onChange={(e) =>
                                              updateDocument(
                                                group.id,
                                                doc.id,
                                                { title: e.target.value }
                                              )
                                            }
                                            placeholder="Название документа (текст ссылки)"
                                            className="font-medium"
                                          />
                                          {doc.url && (
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0"
                                              onClick={() =>
                                                window.open(doc.url, "_blank")
                                              }
                                              title="Открыть документ"
                                            >
                                              <ExternalLink className="h-4 w-4" />
                                            </Button>
                                          )}
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-destructive"
                                            onClick={() =>
                                              removeDocumentFromGroup(group.id, doc.id)
                                            }
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        {doc.file && (
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="outline">
                                              {doc.file.type?.split("/")[1]?.toUpperCase() || "FILE"}
                                            </Badge>
                                            <span>
                                              {(doc.file.size / 1024).toFixed(1)} KB
                                            </span>
                                          </div>
                                        )}
                                        {doc.url && (() => {
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
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                              {fileExtension && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                  <LinkIcon className="h-3 w-3" />
                                                  {fileExtension}
                                                </Badge>
                                              )}
                                              <a
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline truncate max-w-xs"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                {doc.url}
                                              </a>
                                            </div>
                                          );
                                        })()}
                                        <Textarea
                                          value={doc.description || ""}
                                          onChange={(e) =>
                                            updateDocument(group.id, doc.id, {
                                              description: e.target.value,
                                            })
                                          }
                                          placeholder="Описание документа (опционально)"
                                          rows={2}
                                          className="text-sm"
                                        />
                                      </div>
                                    </div>
                                    {!doc.url && !doc.file && (
                                      <div className="space-y-2">
                                        <div className="flex gap-2">
                                          <div className="flex-1">
                                            <Label
                                              htmlFor={`file-${doc.id}`}
                                              className="text-xs text-muted-foreground"
                                            >
                                              Выбрать файл
                                            </Label>
                                            <Input
                                              id={`file-${doc.id}`}
                                              type="file"
                                              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.odt,.ods,.odp"
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  // Определяем MIME-тип по расширению, если file.type пустой
                                                  const getMimeType = (fileName: string, defaultType?: string): string => {
                                                    if (defaultType && defaultType.trim()) {
                                                      return defaultType;
                                                    }
                                                    const ext = fileName.split('.').pop()?.toLowerCase();
                                                    const mimeTypes: { [key: string]: string } = {
                                                      pdf: 'application/pdf',
                                                      doc: 'application/msword',
                                                      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                                      xls: 'application/vnd.ms-excel',
                                                      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                                      txt: 'text/plain',
                                                      rtf: 'application/rtf',
                                                      odt: 'application/vnd.oasis.opendocument.text',
                                                      ods: 'application/vnd.oasis.opendocument.spreadsheet',
                                                      odp: 'application/vnd.oasis.opendocument.presentation',
                                                    };
                                                    return ext && mimeTypes[ext] ? mimeTypes[ext] : 'application/pdf';
                                                  };
                                                  
                                                  const fileType = getMimeType(file.name, file.type);
                                                  
                                                  updateDocument(group.id, doc.id, {
                                                    file,
                                                    size: file.size,
                                                    type: fileType,
                                                    title: doc.title || file.name,
                                                  });
                                                }
                                              }}
                                              className="mt-1"
                                            />
                                          </div>
                                          <div className="text-xs text-muted-foreground flex items-center">
                                            или
                                          </div>
                                        </div>
                                        <div>
                                          <Label
                                            htmlFor={`url-${doc.id}`}
                                            className="text-xs text-muted-foreground"
                                          >
                                            Указать URL документа
                                          </Label>
                                          <div className="flex gap-2 mt-1">
                                            <Input
                                              id={`url-${doc.id}`}
                                              type="url"
                                              placeholder="https://example.com/document.pdf"
                                              value={doc.url || ""}
                                              onChange={(e) => {
                                                const url = e.target.value.trim();
                                                if (url) {
                                                  updateDocument(group.id, doc.id, {
                                                    url,
                                                    file: undefined,
                                                  });
                                                } else {
                                                  updateDocument(group.id, doc.id, {
                                                    url: undefined,
                                                  });
                                                }
                                              }}
                                              className="flex-1"
                                            />
                                            {doc.url && (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-9 px-3"
                                                onClick={() => {
                                                  updateDocument(group.id, doc.id, {
                                                    url: undefined,
                                                  });
                                                }}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addDocumentToGroup(group.id)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Добавить документ в группу
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    )}
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
          </div>
          <div className="flex justify-end space-x-2 p-6 border-t bg-background sticky bottom-0 z-10">
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
        </Tabs>
      </form>
    </Form>
  );
}
