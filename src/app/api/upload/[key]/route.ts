import { NextRequest, NextResponse } from "next/server";
import { deleteFileFromR2, DEFAULT_BUCKET } from "@/lib/r2";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { error: "File key is required", success: false },
        { status: 400 },
      );
    }

    // Декодируем ключ (может содержать слеши)
    const decodedKey = decodeURIComponent(key);

    await deleteFileFromR2({ bucket: DEFAULT_BUCKET, key: decodedKey });

    // Пытаемся удалить миниатюру если есть
    const thumbnailKey = decodedKey.replace(/\.[^/.]+$/, "_thumb.webp");
    try {
      await deleteFileFromR2({ bucket: DEFAULT_BUCKET, key: thumbnailKey });
    } catch (error) {
      // Игнорируем ошибку если миниатюры нет
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete file",
        success: false,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
