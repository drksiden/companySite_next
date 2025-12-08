import { NextRequest, NextResponse } from "next/server";
import {
  listProducts,
  listCategories,
  listBrands,
  listCollections,
} from "@/lib/services/catalog";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "metadata";

    if (type === "products") {
      // Get products with filters
      const params = {
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "50"),
        sort: searchParams.get("sort") || "name.asc",
        categories:
          searchParams.get("category")?.split(",").filter(Boolean) || [],
        brands: searchParams.get("brand")?.split(",").filter(Boolean) || [],
        collections:
          searchParams.get("collections")?.split(",").filter(Boolean) || [],
        search: searchParams.get("search") || undefined,
        minPrice: searchParams.get("minPrice")
          ? parseFloat(searchParams.get("minPrice")!)
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? parseFloat(searchParams.get("maxPrice")!)
          : undefined,
        inStockOnly: searchParams.get("inStockOnly") === "true",
      };

      const products = await listProducts(params);

      return NextResponse.json({
        success: true,
        data: products.data,
        meta: products.meta,
      }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", // Отключаем кэширование
        },
      });
    }

    // Fetch all catalog metadata in parallel (default)
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
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0", // Отключаем кэширование
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
