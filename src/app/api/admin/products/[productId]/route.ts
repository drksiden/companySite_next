import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import {
  uploadFileToR2,
  deleteFileFromR2,
  deleteMultipleFilesFromR2,
  extractKeyFromUrl,
  DEFAULT_BUCKET,
} from "@/lib/r2";

// --- PUT метод для обновления товара ---
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const supabase = await createServerClient();
    const { productId } = await params;
    const formData = await req.formData();

    // Получаем текущие данные о товаре из БД для сравнения
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("images, documents, specifications")
      .eq("id", productId)
      .single();

    if (fetchError || !currentProduct) {
      console.error("Supabase fetch error for current product:", fetchError);
      return NextResponse.json(
        { error: "Product not found or database error." },
        { status: 404 },
      );
    }

    // --- Обработка изображений ---
    const existingImageUrls = formData.getAll("images[]") as string[];
    const imageFiles = formData.getAll("imageFiles") as File[];

    const newImageUrls: string[] = [];
    for (const file of imageFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, "images/products");
        newImageUrls.push(url);
      }
    }
    const imagesToDelete = ((currentProduct.images as string[]) || []).filter(
      (url: string) => !existingImageUrls.includes(url),
    );
    for (const url of imagesToDelete) {
      const key = extractKeyFromUrl(url);
      if (key) {
        await deleteFileFromR2({ bucket: DEFAULT_BUCKET, key });
      }
    }
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    // --- Обработка документов ---
    const existingDocuments = formData.get("documents")
      ? JSON.parse(formData.get("documents") as string)
      : [];
    const documentFiles = formData.getAll("documentFiles") as File[];

    const newDocuments = [];
    for (const file of documentFiles) {
      if (file.size > 0) {
        const url = await uploadFileToR2(file, "documents/products");
        newDocuments.push({ url, name: file.name, type: file.type });
      }
    }
    const documentsToDelete = Array.isArray(currentProduct.documents)
      ? currentProduct.documents.filter(
          (doc: { url: string; name: string; type?: string }) =>
            !existingDocuments.some(
              (existingDoc: { url: string; name: string; type?: string }) =>
                existingDoc.url === doc.url,
            ),
        )
      : [];
    for (const doc of documentsToDelete) {
      const key = extractKeyFromUrl(doc.url);
      if (key) {
        await deleteFileFromR2({ bucket: DEFAULT_BUCKET, key });
      }
    }
    const allDocuments = [...existingDocuments, ...newDocuments];

    // --- Обработка спецификаций ---
    const existingSpecs = formData.get("specifications")
      ? JSON.parse(formData.get("specifications") as string)
      : [];

    // Спецификации не являются файлами, поэтому нет логики для удаления старых
    // и добавления новых файлов.
    // allSpecs - это просто массив, который пришел с формы
    const allSpecs = existingSpecs;

    // --- Сборка данных для обновления ---
    const updatedProductData: { [key: string]: any } = {};

    // Получаем все поля напрямую из formData.get()
    updatedProductData.name = formData.get("name");
    updatedProductData.slug = formData.get("slug");
    updatedProductData.category_id = formData.get("category_id");
    updatedProductData.short_description =
      formData.get("short_description") || null;
    updatedProductData.description = formData.get("description") || null;
    updatedProductData.technical_description =
      formData.get("technical_description") || null;
    updatedProductData.base_price = parseFloat(
      formData.get("base_price") as string,
    );
    updatedProductData.inventory_quantity = parseInt(
      formData.get("inventory_quantity") as string,
    );
    updatedProductData.track_inventory =
      formData.get("track_inventory") === "on";
    updatedProductData.min_stock_level = parseInt(
      formData.get("min_stock_level") as string,
    );
    updatedProductData.allow_backorder =
      formData.get("allow_backorder") === "on";
    updatedProductData.is_featured = formData.get("is_featured") === "on";
    updatedProductData.is_digital = formData.get("is_digital") === "on";
    updatedProductData.sort_order = parseInt(
      formData.get("sort_order") as string,
    );
    updatedProductData.status = formData.get("status");
    updatedProductData.meta_title = formData.get("meta_title") || null;
    updatedProductData.meta_description =
      formData.get("meta_description") || null;
    updatedProductData.meta_keywords = formData.get("meta_keywords") || null;

    // Вложенные объекты
    updatedProductData.dimensions = formData.get("dimensions")
      ? JSON.parse(formData.get("dimensions") as string)
      : null;
    updatedProductData.brand_id =
      formData.get("brand_id") === "null" ? null : formData.get("brand_id");
    updatedProductData.collection_id =
      formData.get("collection_id") === "null"
        ? null
        : formData.get("collection_id");

    // Массивы, которые мы обработали выше
    updatedProductData.images = allImageUrls;
    updatedProductData.documents = allDocuments;
    updatedProductData.specifications = allSpecs;

    // Обновление в Supabase
    const { data, error } = await supabase
      .from("products")
      .update(updatedProductData)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// --- DELETE метод для удаления товара ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const supabase = await createServerClient();
    const { productId } = await params;

    // Сначала получаем URL изображений и документов, связанных с товаром
    const { data: productToDelete, error: fetchError } = await supabase
      .from("products")
      .select("images, documents, specifications")
      .eq("id", productId)
      .single();

    if (fetchError || !productToDelete) {
      console.error("Supabase fetch error for product to delete:", fetchError);
      return NextResponse.json(
        { error: "Product not found or database error." },
        { status: 404 },
      );
    }

    // Удаляем файлы из R2
    const filesToDelete: (string | null | undefined)[] = [];

    // Собираем все URL файлов для удаления
    if (productToDelete.images && Array.isArray(productToDelete.images)) {
      filesToDelete.push(...productToDelete.images);
    }

    if (productToDelete.documents && Array.isArray(productToDelete.documents)) {
      filesToDelete.push(
        ...productToDelete.documents.map((doc: { url: string }) => doc.url),
      );
    }

    if (
      productToDelete.specifications &&
      Array.isArray(productToDelete.specifications)
    ) {
      filesToDelete.push(
        ...productToDelete.specifications.map(
          (spec: { url: string }) => spec.url,
        ),
      );
    }

    // Удаляем все файлы одновременно
    const validFilesToDelete = filesToDelete.filter(
      (url): url is string => url != null && typeof url === "string",
    );
    await deleteMultipleFilesFromR2(validFilesToDelete);

    // Удаляем товар из Supabase
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Server error in DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
