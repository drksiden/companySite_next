import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/services/catalog";
import { logError, logInfo, logHttp } from "@/lib/logger/server";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    
    logHttp('GET /api/catalog/products', {
      method: 'GET',
      endpoint: '/api/catalog/products',
      queryParams: Object.fromEntries(searchParams),
    });

    // Convert URLSearchParams to plain object for zod parsing
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const result = await listProducts(queryParams);

    const duration = Date.now() - startTime;
    logInfo('Products fetched successfully', {
      endpoint: '/api/catalog/products',
      method: 'GET',
      totalProducts: result.meta.total,
      returnedProducts: result.data.length,
      duration: `${duration}ms`,
      queryParams: Object.fromEntries(searchParams),
    });

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
    logError("Catalog products API error", error as Error, {
      endpoint: '/api/catalog/products',
      method: 'GET',
      errorType: 'catalog-products-api-error',
    });

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
