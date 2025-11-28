import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      query = query.eq("category_id", category);
    }

    if (brand && brand !== "all") {
      query = query.eq("brand_id", brand);
    }

    if (featured && featured !== "all") {
      query = query.eq("is_featured", featured === "true");
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 },
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

    if (status && status !== "all") {
      countQuery = countQuery.eq("status", status);
    }
    if (category && category !== "all") {
      countQuery = countQuery.eq("category_id", category);
    }
    if (brand && brand !== "all") {
      countQuery = countQuery.eq("brand_id", brand);
    }
    if (featured && featured !== "all") {
      countQuery = countQuery.eq("is_featured", featured === "true");
    }
    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    const { count } = await countQuery;
    const total = count || 0;
    const hasMore = total > offset + limit;

    return NextResponse.json({
      products: products || [],
      total,
      hasMore,
    });
  } catch (error) {
    console.error("Error in products GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const formData = await req.formData();

    // --- Обработка изображений ---
    const imageFiles = formData.getAll("imageFiles") as File[];
    const newImageUrls: string[] = [];
    const uploadErrors: string[] = [];

    for (const file of imageFiles) {
      if (file.size > 0) {
        try {
          const { uploadFileToR2, validateImageFile } = await import(
            "@/lib/r2"
          );

          // Валидация файла
          const validation = validateImageFile(file);
          if (!validation.valid) {
            uploadErrors.push(`Image ${file.name}: ${validation.error}`);
            continue;
          }

          const url = await uploadFileToR2(file, "images/products");
          newImageUrls.push(url);
          console.log(`Successfully uploaded image: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload image ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          uploadErrors.push(errorMessage);
        }
      }
    }

    // --- Обработка документов ---
    const documentFiles = formData.getAll("documentFiles") as File[];
    const documentsStructureStr = formData.get("documentsStructure") as string;
    
    // Вспомогательная функция для определения MIME-типа по расширению файла из URL
    const getMimeTypeFromUrl = (url: string): string | null => {
      // Расширенный список MIME-типов
      const mimeTypes: { [key: string]: string } = {
        // Документы
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        rtf: 'application/rtf',
        odt: 'application/vnd.oasis.opendocument.text',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        odp: 'application/vnd.oasis.opendocument.presentation',
        csv: 'text/csv',
        // Изображения
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        ico: 'image/x-icon',
        // CAD и технические файлы
        dwg: 'application/acad',
        dxf: 'application/dxf',
        step: 'application/step',
        stp: 'application/step',
        iges: 'application/iges',
        igs: 'application/iges',
        // Архивы
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        // Другие
        xml: 'application/xml',
        json: 'application/json',
        js: 'application/javascript',
        css: 'text/css',
        html: 'text/html',
        htm: 'text/html',
      };

      try {
        // Пытаемся извлечь расширение из URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const match = pathname.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
        if (match) {
          const ext = match[1].toLowerCase();
          return mimeTypes[ext] || null;
        }
      } catch {
        // Если не валидный URL, пытаемся найти расширение в конце строки
        const match = url.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
        if (match) {
          const ext = match[1].toLowerCase();
          return mimeTypes[ext] || null;
        }
      }
      return null;
    };
    
    // Загружаем файлы документов
    const uploadedFileUrls: string[] = [];
    for (const file of documentFiles) {
      if (file.size > 0) {
        try {
          const { uploadFileToR2, validateDocumentFile } = await import(
            "@/lib/r2"
          );

          // Валидация файла
          const validation = validateDocumentFile(file);
          if (!validation.valid) {
            uploadErrors.push(`Document ${file.name}: ${validation.error}`);
            continue;
          }

          const url = await uploadFileToR2(file, "documents/products");
          uploadedFileUrls.push(url);
          console.log(`Successfully uploaded document: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload document ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          uploadErrors.push(errorMessage);
        }
      }
    }

    // Обрабатываем структуру документов с группами
    let finalDocuments = [];
    if (documentsStructureStr) {
      try {
        const documentsStructure = JSON.parse(documentsStructureStr);
        let fileIndex = 0;

        // Создаем карту файлов по имени для более точного сопоставления
        const fileMap = new Map<string, { file: File; url: string; index: number }>();
        documentFiles.forEach((file, idx) => {
          if (idx < uploadedFileUrls.length) {
            fileMap.set(file.name, { file, url: uploadedFileUrls[idx], index: idx });
          }
        });

        // Преобразуем структуру: проходим по группам и документам, добавляем URL для новых файлов
        finalDocuments = documentsStructure.map((group: any) => ({
          title: group.title,
          documents: group.documents.map((doc: any) => {
            if (doc.url) {
              // Существующий документ или документ по URL (не загружаем на R2)
              // ВСЕГДА определяем тип из URL, игнорируя doc.type (он может быть неправильным, например "pdf" вместо "application/pdf")
              const urlMimeType = getMimeTypeFromUrl(doc.url);
              // Если тип не определен из URL, пытаемся определить из имени файла в URL
              let finalType = urlMimeType;
              if (!finalType) {
                // Пытаемся извлечь расширение из имени файла в URL
                const urlParts = doc.url.split('/');
                const fileName = urlParts[urlParts.length - 1] || '';
                const extMatch = fileName.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
                if (extMatch) {
                  finalType = getMimeTypeFromUrl(`file.${extMatch[1]}`);
                }
              }
              return {
                title: doc.title,
                url: doc.url,
                description: doc.description,
                size: doc.size,
                // Используем определенный тип, если не удалось - не устанавливаем (undefined)
                type: finalType || undefined,
              };
            } else if (doc.fileName && fileMap.has(doc.fileName)) {
              // Новый документ - находим файл по имени для точного сопоставления
              const fileData = fileMap.get(doc.fileName)!;
              // Для новых файлов используем тип из самого файла (file.type), так как он самый точный
              return {
                title: doc.title,
                url: fileData.url,
                description: doc.description,
                size: doc.size || fileData.file.size,
                // Приоритет: тип из файла (самый точный), затем из структуры, затем из URL загруженного файла
                type: fileData.file.type || doc.type || getMimeTypeFromUrl(fileData.url) || undefined,
              };
            } else if (fileIndex < uploadedFileUrls.length && fileIndex < documentFiles.length) {
              // Fallback: сопоставление по порядку, если имя файла не совпало
              const url = uploadedFileUrls[fileIndex];
              const file = documentFiles[fileIndex];
              fileIndex++;
              return {
                title: doc.title,
                url,
                description: doc.description,
                size: doc.size || file.size,
                // Приоритет: тип из файла (самый точный), затем из структуры, затем из URL
                type: file.type || doc.type || getMimeTypeFromUrl(url) || undefined,
              };
            }
            return null;
          }).filter(Boolean), // Убираем null
        }));
      } catch (error) {
        console.error("Error parsing documents structure:", error);
        // Fallback к старому формату, если парсинг не удался
        finalDocuments = uploadedFileUrls.map((url, index) => ({
          name: documentFiles[index]?.name || `Document ${index + 1}`,
          url,
          type: documentFiles[index]?.type,
        }));
      }
    } else {
      // Старый формат - простая обработка без групп
      finalDocuments = uploadedFileUrls.map((url, index) => ({
        name: documentFiles[index]?.name || `Document ${index + 1}`,
        url,
        type: documentFiles[index]?.type,
      }));
    }

    // Если есть ошибки загрузки, логируем их но продолжаем создание товара
    if (uploadErrors.length > 0) {
      console.warn("Upload errors occurred:", uploadErrors);
    }

    // --- Сборка данных для создания ---
    const insertData: { [key: string]: unknown } = {};

    // Получаем базовую валюту по умолчанию
    const { data: defaultCurrency } = await supabase
      .from("currencies")
      .select("id")
      .eq("is_base", true)
      .single();

    for (const [key, value] of formData.entries()) {
      // Исключаем поля, которые мы обрабатываем вручную
      if (
        [
          "imageFiles",
          "documentFiles",
          "existingImages",
          "existingDocuments",
          "documentsStructure",
        ].includes(key)
      )
        continue;

      if (typeof value === "string") {
        switch (key) {
          case "base_price":
          case "sale_price":
          case "cost_price":
          case "weight":
            insertData[key] = value ? parseFloat(value) : null;
            break;
          case "inventory_quantity":
          case "min_stock_level":
          case "sort_order":
          case "view_count":
          case "sales_count":
            insertData[key] = value ? parseInt(value) : 0;
            break;
          case "track_inventory":
          case "allow_backorder":
          case "is_featured":
          case "is_digital":
            insertData[key] = value === "true";
            break;
          case "brand_id":
          case "collection_id":
            insertData[key] =
              value === "null" ||
              value === "" ||
              value === "no-brand" ||
              value === "no-collection"
                ? null
                : value;
            break;
          case "currency_id":
            insertData[key] = value || defaultCurrency?.id;
            break;
          case "dimensions":
          case "specifications":
            try {
              insertData[key] = value ? JSON.parse(value) : {};
            } catch {
              insertData[key] = {};
            }
            break;
          case "status":
            insertData[key] = value || "draft";
            break;
          default:
            insertData[key] = value || null;
            break;
        }
      }
    }

    // Добавляем обновленные массивы
    // Убеждаемся, что images всегда массив строк (не null, не undefined)
    insertData.images = Array.isArray(newImageUrls) && newImageUrls.length > 0 
      ? newImageUrls 
      : [];
    insertData.documents = finalDocuments;

    // Устанавливаем валюту по умолчанию, если не указана
    if (!insertData.currency_id && defaultCurrency) {
      insertData.currency_id = defaultCurrency.id;
    }

    // Генерируем slug из названия, если не указан
    if (!insertData.slug && insertData.name) {
      insertData.slug = (insertData.name as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Валидация обязательных полей
    if (!insertData.name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    if (!insertData.category_id) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 },
      );
    }

    if (!insertData.currency_id) {
      return NextResponse.json(
        { error: "Currency is required" },
        { status: 400 },
      );
    }

    if (!insertData.base_price || Number(insertData.base_price) <= 0) {
      return NextResponse.json(
        { error: "Base price is required and must be greater than 0" },
        { status: 400 },
      );
    }

    // Устанавливаем published_at для активных товаров
    if (insertData.status === "active" && !insertData.published_at) {
      insertData.published_at = new Date().toISOString();
    }

    // Проверяем авторизацию перед запросом
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please refresh your session." },
        { status: 401 },
      );
    }

    // Сохранение в Supabase с полными связанными данными
    const { data, error } = await supabase
      .from("products")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      
      // Если ошибка связана с авторизацией, возвращаем 401
      if (error.code === "PGRST301" || error.message?.includes("JWT") || error.message?.includes("token")) {
        return NextResponse.json(
          { error: "Session expired. Please refresh your session and try again." },
          { status: 401 },
        );
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Возвращаем результат с информацией о загрузке файлов
    const response = {
      ...data,
      uploadInfo: {
        imagesUploaded: newImageUrls.length,
        documentsUploaded: uploadedFileUrls.length,
        errors: uploadErrors.length > 0 ? uploadErrors : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error in POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const formData = await req.formData();

    const productId = formData.get("id") as string;
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // --- Обработка изображений ---
    const imageFiles = formData.getAll("imageFiles") as File[];
    const existingImages = JSON.parse(
      (formData.get("existingImages") as string) || "[]",
    );
    const newImageUrls: string[] = [];

    const updateUploadErrors: string[] = [];

    for (const file of imageFiles) {
      if (file.size > 0) {
        try {
          const { uploadFileToR2, validateImageFile } = await import(
            "@/lib/r2"
          );

          // Валидация файла
          const validation = validateImageFile(file);
          if (!validation.valid) {
            updateUploadErrors.push(`Image ${file.name}: ${validation.error}`);
            continue;
          }

          const url = await uploadFileToR2(file, "images/products");
          newImageUrls.push(url);
          console.log(`Successfully uploaded image: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload image ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          updateUploadErrors.push(errorMessage);
        }
      }
    }

    // --- Обработка документов ---
    const documentFiles = formData.getAll("documentFiles") as File[];
    const documentsStructureStr = formData.get("documentsStructure") as string;
    
    // Вспомогательная функция для определения MIME-типа по расширению файла из URL
    const getMimeTypeFromUrl = (url: string): string | null => {
      // Расширенный список MIME-типов
      const mimeTypes: { [key: string]: string } = {
        // Документы
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        rtf: 'application/rtf',
        odt: 'application/vnd.oasis.opendocument.text',
        ods: 'application/vnd.oasis.opendocument.spreadsheet',
        odp: 'application/vnd.oasis.opendocument.presentation',
        csv: 'text/csv',
        // Изображения
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        bmp: 'image/bmp',
        ico: 'image/x-icon',
        // CAD и технические файлы
        dwg: 'application/acad',
        dxf: 'application/dxf',
        step: 'application/step',
        stp: 'application/step',
        iges: 'application/iges',
        igs: 'application/iges',
        // Архивы
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        // Другие
        xml: 'application/xml',
        json: 'application/json',
        js: 'application/javascript',
        css: 'text/css',
        html: 'text/html',
        htm: 'text/html',
      };

      try {
        // Пытаемся извлечь расширение из URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const match = pathname.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
        if (match) {
          const ext = match[1].toLowerCase();
          return mimeTypes[ext] || null;
        }
      } catch {
        // Если не валидный URL, пытаемся найти расширение в конце строки
        const match = url.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
        if (match) {
          const ext = match[1].toLowerCase();
          return mimeTypes[ext] || null;
        }
      }
      return null;
    };
    
    // Загружаем файлы документов
    const uploadedFileUrls: string[] = [];
    for (const file of documentFiles) {
      if (file.size > 0) {
        try {
          const { uploadFileToR2, validateDocumentFile } = await import(
            "@/lib/r2"
          );

          // Валидация файла
          const validation = validateDocumentFile(file);
          if (!validation.valid) {
            updateUploadErrors.push(
              `Document ${file.name}: ${validation.error}`,
            );
            continue;
          }

          const url = await uploadFileToR2(file, "documents/products");
          uploadedFileUrls.push(url);
          console.log(`Successfully uploaded document: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload document ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          updateUploadErrors.push(errorMessage);
        }
      }
    }

    // Обрабатываем структуру документов с группами
    let finalDocuments = [];
    if (documentsStructureStr) {
      try {
        const documentsStructure = JSON.parse(documentsStructureStr);
        let fileIndex = 0;

        // Создаем карту файлов по имени для более точного сопоставления
        const fileMap = new Map<string, { file: File; url: string; index: number }>();
        documentFiles.forEach((file, idx) => {
          if (idx < uploadedFileUrls.length) {
            fileMap.set(file.name, { file, url: uploadedFileUrls[idx], index: idx });
          }
        });

        // Преобразуем структуру: проходим по группам и документам, добавляем URL для новых файлов
        finalDocuments = documentsStructure.map((group: any) => ({
          title: group.title,
          documents: group.documents.map((doc: any) => {
            if (doc.url) {
              // Существующий документ или документ по URL (не загружаем на R2)
              // ВСЕГДА определяем тип из URL, игнорируя doc.type (он может быть неправильным, например "pdf" вместо "application/pdf")
              const urlMimeType = getMimeTypeFromUrl(doc.url);
              // Если тип не определен из URL, пытаемся определить из имени файла в URL
              let finalType = urlMimeType;
              if (!finalType) {
                // Пытаемся извлечь расширение из имени файла в URL
                const urlParts = doc.url.split('/');
                const fileName = urlParts[urlParts.length - 1] || '';
                const extMatch = fileName.match(/\.([a-z0-9]+)(?:\?|$|#)/i);
                if (extMatch) {
                  finalType = getMimeTypeFromUrl(`file.${extMatch[1]}`);
                }
              }
              return {
                title: doc.title,
                url: doc.url,
                description: doc.description,
                size: doc.size,
                // Используем определенный тип, если не удалось - не устанавливаем (undefined)
                type: finalType || undefined,
              };
            } else if (doc.fileName && fileMap.has(doc.fileName)) {
              // Новый документ - находим файл по имени для точного сопоставления
              const fileData = fileMap.get(doc.fileName)!;
              // Для новых файлов используем тип из самого файла (file.type), так как он самый точный
              return {
                title: doc.title,
                url: fileData.url,
                description: doc.description,
                size: doc.size || fileData.file.size,
                // Приоритет: тип из файла (самый точный), затем из структуры, затем из URL загруженного файла
                type: fileData.file.type || doc.type || getMimeTypeFromUrl(fileData.url) || undefined,
              };
            } else if (fileIndex < uploadedFileUrls.length && fileIndex < documentFiles.length) {
              // Fallback: сопоставление по порядку, если имя файла не совпало
              const url = uploadedFileUrls[fileIndex];
              const file = documentFiles[fileIndex];
              fileIndex++;
              return {
                title: doc.title,
                url,
                description: doc.description,
                size: doc.size || file.size,
                // Приоритет: тип из файла (самый точный), затем из структуры, затем из URL
                type: file.type || doc.type || getMimeTypeFromUrl(url) || undefined,
              };
            }
            return null;
          }).filter(Boolean), // Убираем null
        }));
      } catch (error) {
        console.error("Error parsing documents structure:", error);
        // Fallback к старому формату
        const existingDocuments = JSON.parse(
          (formData.get("existingDocuments") as string) || "[]",
        );
        finalDocuments = [
          ...existingDocuments,
          ...uploadedFileUrls.map((url, index) => ({
            name: documentFiles[index]?.name || `Document ${index + 1}`,
            url,
            type: documentFiles[index]?.type,
          })),
        ];
      }
    } else {
      // Старый формат
      const existingDocuments = JSON.parse(
        (formData.get("existingDocuments") as string) || "[]",
      );
      finalDocuments = [
        ...existingDocuments,
        ...uploadedFileUrls.map((url, index) => ({
          name: documentFiles[index]?.name || `Document ${index + 1}`,
          url,
          type: documentFiles[index]?.type,
        })),
      ];
    }

    // Если есть ошибки загрузки, логируем их но продолжаем обновление товара
    if (updateUploadErrors.length > 0) {
      console.warn("Upload errors occurred during update:", updateUploadErrors);
    }

    // --- Сборка данных для обновления ---
    const updateData: { [key: string]: unknown } = {};

    // Получаем базовую валюту по умолчанию
    const { data: defaultCurrency } = await supabase
      .from("currencies")
      .select("id")
      .eq("is_base", true)
      .single();

    for (const [key, value] of formData.entries()) {
      // Исключаем поля, которые мы обрабатываем вручную
      if (
        [
          "id",
          "imageFiles",
          "documentFiles",
          "existingImages",
          "existingDocuments",
          "documentsStructure",
        ].includes(key)
      )
        continue;

      if (typeof value === "string") {
        switch (key) {
          case "base_price":
          case "sale_price":
          case "cost_price":
          case "weight":
            updateData[key] = value ? parseFloat(value) : null;
            break;
          case "inventory_quantity":
          case "min_stock_level":
          case "sort_order":
          case "view_count":
          case "sales_count":
            updateData[key] = value ? parseInt(value) : 0;
            break;
          case "track_inventory":
          case "allow_backorder":
          case "is_featured":
          case "is_digital":
            updateData[key] = value === "true";
            break;
          case "brand_id":
          case "collection_id":
            updateData[key] =
              value === "null" ||
              value === "" ||
              value === "no-brand" ||
              value === "no-collection"
                ? null
                : value;
            break;
          case "currency_id":
            updateData[key] = value || defaultCurrency?.id;
            break;
          case "dimensions":
          case "specifications":
            try {
              updateData[key] = value ? JSON.parse(value) : {};
            } catch {
              updateData[key] = {};
            }
            break;
          case "status":
            updateData[key] = value || "draft";
            break;
          default:
            updateData[key] = value || null;
            break;
        }
      }
    }

    // Объединяем существующие и новые изображения
    // Убеждаемся, что images всегда массив строк
    const allImages = [
      ...(Array.isArray(existingImages) ? existingImages : []),
      ...(Array.isArray(newImageUrls) ? newImageUrls : [])
    ];
    updateData.images = allImages.length > 0 ? allImages : [];

    // Используем структурированные документы
    updateData.documents = finalDocuments;

    // Валидация обязательных полей при обновлении
    if (
      updateData.hasOwnProperty("base_price") &&
      (!updateData.base_price || Number(updateData.base_price) <= 0)
    ) {
      return NextResponse.json(
        { error: "Base price must be greater than 0" },
        { status: 400 },
      );
    }

    // Устанавливаем published_at для активных товаров
    if (updateData.status === "active") {
      const { data: currentProduct } = await supabase
        .from("products")
        .select("published_at")
        .eq("id", productId)
        .single();

      if (!currentProduct?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    // Обновление в Supabase
    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Возвращаем результат с информацией о загрузке файлов
    const response = {
      ...data,
      uploadInfo: {
        imagesUploaded: newImageUrls.length,
        documentsUploaded: uploadedFileUrls.length,
        errors: updateUploadErrors.length > 0 ? updateUploadErrors : undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Server error in PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error in DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
