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
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("products")
      .select(
        `
        *,
        categories:category_id (
          id,
          name,
          slug,
          path,
          level
        ),
        brands:brand_id (
          id,
          name,
          slug,
          logo_url
        ),
        collections:collection_id (
          id,
          name,
          slug
        ),
        currencies:currency_id (
          id,
          code,
          symbol,
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    if (brand) {
      query = query.eq("brand_id", brand);
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
    if (category) {
      countQuery = countQuery.eq("category_id", category);
    }
    if (brand) {
      countQuery = countQuery.eq("brand_id", brand);
    }
    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    const { count } = await countQuery;

    return NextResponse.json({
      products: products || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
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
    const newDocuments = [];

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
          newDocuments.push({ url, name: file.name, type: file.type });
          console.log(`Successfully uploaded document: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload document ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          uploadErrors.push(errorMessage);
        }
      }
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
    insertData.images = newImageUrls;
    insertData.documents = newDocuments;

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

    // Сохранение в Supabase с полными связанными данными
    const { data, error } = await supabase
      .from("products")
      .insert(insertData)
      .select(
        `
        *,
        categories (
          id,
          name,
          slug,
          path,
          level
        ),
        brands (
          id,
          name,
          slug,
          logo_url
        ),
        collections (
          id,
          name,
          slug
        ),
        currencies (
          id,
          code,
          symbol,
          name
        )
      `,
      )
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Возвращаем результат с информацией о загрузке файлов
    const response = {
      ...data,
      uploadInfo: {
        imagesUploaded: newImageUrls.length,
        documentsUploaded: newDocuments.length,
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
    const existingDocuments = JSON.parse(
      (formData.get("existingDocuments") as string) || "[]",
    );
    const newDocuments = [];

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
          newDocuments.push({ url, name: file.name, type: file.type });
          console.log(`Successfully uploaded document: ${file.name} -> ${url}`);
        } catch (error) {
          const errorMessage = `Failed to upload document ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          updateUploadErrors.push(errorMessage);
        }
      }
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
    updateData.images = [...existingImages, ...newImageUrls];

    // Объединяем существующие и новые документы
    updateData.documents = [...existingDocuments, ...newDocuments];

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
      .select(
        `
        *,
        categories:category_id (
          id,
          name,
          slug,
          path,
          level
        ),
        brands:brand_id (
          id,
          name,
          slug,
          logo_url
        ),
        collections:collection_id (
          id,
          name,
          slug
        ),
        currencies:currency_id (
          id,
          code,
          symbol,
          name
        )
      `,
      )
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
        documentsUploaded: newDocuments.length,
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
