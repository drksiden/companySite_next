import { NextRequest, NextResponse } from "next/server";
import { listBrands } from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  try {
    const brands = await listBrands();

    return NextResponse.json(
      {
        success: true,
        data: brands,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300", // Cache for 5 minutes
        },
      },
    );
  } catch (error) {
    console.error("Catalog brands API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch brands",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
