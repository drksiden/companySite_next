import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", newsId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Новость не найдена" }, { status: 404 });
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Ошибка при загрузке новости" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверяем, это JSON или FormData
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      // Простое обновление (например, только статус)
      const body = await req.json();
      console.log("Updating news with JSON:", { newsId, body });
      
      // Обновляем с возвратом результата сразу, используя maybeSingle
      const { data: updatedNews, error: updateError } = await supabase
        .from("news")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", newsId)
        .select()
        .maybeSingle();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json(
          { error: "Ошибка при обновлении новости", details: updateError.message },
          { status: 500 }
        );
      }

      if (!updatedNews) {
        console.warn("News not found after update:", newsId);
        // Проверяем, существует ли вообще запись
        const { data: checkData, error: checkError } = await supabase
          .from("news")
          .select("id")
          .eq("id", newsId)
          .maybeSingle();

        if (!checkData && !checkError) {
          return NextResponse.json(
            { error: "Новость не найдена" },
            { status: 404 }
          );
        }

        return NextResponse.json(
          { error: "Ошибка: новость не была обновлена" },
          { status: 500 }
        );
      }

      return NextResponse.json(updatedNews);
    }

    // Полная форма с файлами
    const formData = await req.formData();

    // Получаем текущую новость
    const { data: existingNews, error: fetchError } = await supabase
      .from("news")
      .select("*")
      .eq("id", newsId)
      .single();

    if (fetchError || !existingNews) {
      return NextResponse.json(
        { error: "Новость не найдена" },
        { status: 404 }
      );
    }

    // Получаем данные формы
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;
    const author = formData.get("author") as string;
    const is_active = formData.get("is_active") === "true";
    const tagsStr = formData.get("tags") as string;

    // Валидация обязательных полей
    if (!title || !description || !date || !category) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля" },
        { status: 400 }
      );
    }

    // Валидация длины полей
    if (title.length > 200) {
      return NextResponse.json(
        { error: "Заголовок не должен превышать 200 символов" },
        { status: 400 }
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { error: "Краткое описание не должно превышать 500 символов" },
        { status: 400 }
      );
    }
    if (content && content.length > 50000) {
      return NextResponse.json(
        { error: "Содержание не должно превышать 50000 символов" },
        { status: 400 }
      );
    }

    // Парсим теги
    let tags: string[] = [];
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
      } catch {
        tags = [];
      }
    }

    // Обрабатываем существующие изображения
    const existingImagesStr = formData.get("existingImages") as string;
    let existingImages: string[] = [];
    if (existingImagesStr) {
      try {
        existingImages = JSON.parse(existingImagesStr);
      } catch {
        existingImages = Array.isArray(existingNews.images)
          ? existingNews.images
          : [];
      }
    }

    // Обрабатываем существующие документы
    const existingDocumentsStr = formData.get("existingDocuments") as string;
    let existingDocuments: string[] = [];
    if (existingDocumentsStr) {
      try {
        existingDocuments = JSON.parse(existingDocumentsStr);
      } catch {
        existingDocuments = Array.isArray(existingNews.documents)
          ? existingNews.documents
          : [];
      }
    }

    // --- Обработка новых изображений ---
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

    // --- Обработка новых документов (файлы) ---
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
    const documentUrls: string[] = [];
    if (documentUrlsStr) {
      try {
        const parsed = JSON.parse(documentUrlsStr);
        if (Array.isArray(parsed)) {
          parsed.forEach((doc: any) => {
            if (doc.url) {
              // Добавляем URL напрямую, без загрузки
              documentUrls.push(doc.url);
            }
          });
        }
      } catch (error) {
        console.error("Error parsing documentUrls:", error);
      }
    }

    // Собираем все изображения
    const images = [...existingImages, ...newImageUrls];

    // Собираем все документы: существующие + новые загруженные + URL
    const documents = [
      ...existingDocuments,
      ...uploadedDocumentUrls,
      ...documentUrls,
    ];

    // Обновляем новость
    const { data: updatedNews, error: updateError } = await supabase
      .from("news")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", newsId)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Ошибка при обновлении новости", details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...updatedNews,
      uploadInfo: {
        imagesUploaded: newImageUrls.length,
        documentsUploaded: uploadedDocumentUrls.length + documentUrls.length,
        errors: uploadErrors,
      },
    });
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ newsId: string }> }
) {
  try {
    const { newsId } = await params;
    const supabase = await createServerClient();

    // Check if user is authenticated and is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase.from("news").delete().eq("id", newsId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Ошибка при удалении новости", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

