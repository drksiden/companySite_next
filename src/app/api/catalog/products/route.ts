import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Convert URLSearchParams to plain object for zod parsing
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const result = await listProducts(queryParams);

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        meta: result.meta,
      },
      {
        headers: {
          "Cache-Control": "no-store", // Dynamic catalog data
          "X-Total-Count": result.meta.total.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Catalog products API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
