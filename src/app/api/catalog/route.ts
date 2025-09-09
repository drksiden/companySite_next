import { NextRequest, NextResponse } from "next/server";
import {
  listCategories,
  listBrands,
  listCollections,
} from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  try {
    // Fetch all catalog metadata in parallel
    const [categories, brands, collections] = await Promise.all([
      listCategories(),
      listBrands(),
      listCollections(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          categories,
          brands,
          collections,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      },
    );
  } catch (error) {
    console.error("Catalog API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch catalog data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
