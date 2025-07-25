import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;

    if (!key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    // Декодируем ключ файла
    const decodedKey = decodeURIComponent(key);

    // Проверяем, что это безопасный путь
    if (decodedKey.includes("..") || decodedKey.startsWith("/")) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Формируем URL для R2/CDN
    const fileUrl = `${process.env.R2_PUBLIC_URL}/${decodedKey}`;

    // Перенаправляем на CDN URL
    return NextResponse.redirect(fileUrl, 302);

  } catch (error) {
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
