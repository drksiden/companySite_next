import { NextRequest, NextResponse } from "next/server";
import { listCategories } from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  try {
    const categories = await listCategories();

    return NextResponse.json(
      {
        success: true,
        data: categories,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      },
    );
  } catch (error) {
    console.error("Catalog categories API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
