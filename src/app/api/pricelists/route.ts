import { NextRequest, NextResponse } from "next/server";
import { listFilesFromR2Folder, DEFAULT_BUCKET } from "@/lib/r2";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    // Пробуем разные варианты путей (начинаем с того, что использовалось в старом коде)
    const possiblePaths = [
      "documents/pricelists", // Стандартный путь из старого кода
      "asia-ntb/documents/pricelists",
      "pricelists",
    ];

    let files: Array<{ key: string; name: string; url: string; size?: number; lastModified?: Date }> = [];

    // Пробуем найти файлы в разных путях
    for (const path of possiblePaths) {
      const foundFiles = await listFilesFromR2Folder(path, DEFAULT_BUCKET);
      if (foundFiles.length > 0) {
        files = foundFiles;
        break;
      }
    }

    // Если не нашли, пробуем поиск без префикса
    if (files.length === 0) {
      // Пробуем найти все файлы с "pricelist" в ключе
      const allFiles = await listFilesFromR2Folder("", DEFAULT_BUCKET);
      files = allFiles.filter((file) => 
        file.key.toLowerCase().includes("pricelist") || 
        file.key.toLowerCase().includes("прайс")
      );
    }

    // Формируем массив прайслистов
    const pricelists = files.map((file) => ({
      name: file.name,
      url: file.url,
      size: file.size,
      lastModified: file.lastModified?.toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: pricelists,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching pricelists:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch pricelists",
        data: [],
      },
      { status: 500 }
    );
  }
}
