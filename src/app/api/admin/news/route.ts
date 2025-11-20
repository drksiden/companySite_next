import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Параметры запроса
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const is_active = searchParams.get("is_active");

    // Строим запрос
    let query = supabase.from("news").select("*").order("date", {
      ascending: false,
    });

    // Применяем фильтры
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (is_active && is_active !== "all") {
      query = query.eq("is_active", is_active === "true");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Ошибка при загрузке новостей" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    // Получаем данные формы
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;
    const author = formData.get("author") as string;
    const is_active = formData.get("is_active") === "true";
    const tagsStr = formData.get("tags") as string;

    // Парсим теги
    let tags: string[] = [];
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
      } catch {
        tags = [];
      }
    }

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

          const validation = validateImageFile(file);
          if (!validation.valid) {
            uploadErrors.push(`Image ${file.name}: ${validation.error}`);
            continue;
          }

          const url = await uploadFileToR2(file, "images/news");
          newImageUrls.push(url);
        } catch (error) {
          const errorMessage = `Failed to upload image ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          uploadErrors.push(errorMessage);
        }
      }
    }

    // --- Обработка документов (файлы) ---
    const documentFiles = formData.getAll("documentFiles") as File[];
    const uploadedDocumentUrls: string[] = [];

    for (const file of documentFiles) {
      if (file.size > 0) {
        try {
          const { uploadFileToR2, validateDocumentFile } = await import(
            "@/lib/r2"
          );

          const validation = validateDocumentFile(file);
          if (!validation.valid) {
            uploadErrors.push(`Document ${file.name}: ${validation.error}`);
            continue;
          }

          const url = await uploadFileToR2(file, "documents/news");
          uploadedDocumentUrls.push(url);
        } catch (error) {
          const errorMessage = `Failed to upload document ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage, error);
          uploadErrors.push(errorMessage);
        }
      }
    }

    // --- Обработка документов по URL ---
    const documentUrlsStr = formData.get("documentUrls") as string;
    const documentUrls: Array<{ url: string; name: string }> = [];
    if (documentUrlsStr) {
      try {
        const parsed = JSON.parse(documentUrlsStr);
        if (Array.isArray(parsed)) {
          parsed.forEach((doc: any) => {
            if (doc.url) {
              // Добавляем URL напрямую, без загрузки
              documentUrls.push({
                url: doc.url,
                name: doc.name || doc.url,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error parsing documentUrls:", error);
      }
    }

    // Собираем все изображения
    const images = newImageUrls.length > 0 ? newImageUrls : [];

    // Собираем документы: сначала загруженные файлы, потом URL
    const documents = [
      ...uploadedDocumentUrls,
      ...documentUrls.map((doc) => doc.url),
    ];

    // Вставляем новость в базу данных
    const { data: newsData, error: insertError } = await supabase
      .from("news")
      .insert({
        title,
        description,
        content: content || null,
        date,
        category,
        author: author || null,
        images: images.length > 0 ? images : null,
        tags: tags.length > 0 ? tags : null,
        documents: documents.length > 0 ? documents : null,
        is_active,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "Ошибка при создании новости", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...newsData,
      uploadInfo: {
        imagesUploaded: newImageUrls.length,
        documentsUploaded: uploadedDocumentUrls.length,
        errors: uploadErrors,
      },
    });
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

