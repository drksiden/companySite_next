import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          brands: [],
          categories: [],
          total: 0,
        },
      });
    }

    const supabase = await createClient();
    const searchTerm = query.trim();

    // Поиск товаров
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        sku,
        short_description,
        base_price,
        sale_price,
        thumbnail,
        inventory_quantity,
        is_featured,
        brands:brand_id(
          id,
          name,
          slug
        ),
        categories:category_id(
          id,
          name,
          slug,
          path
        ),
        currencies:currency_id(
          id,
          code,
          symbol
        )
      `,
      )
      .eq("status", "active")
      .or(
        `name.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`,
      )
      .limit(limit)
      .order("is_featured", { ascending: false })
      .order("view_count", { ascending: false });

    // Поиск брендов
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url")
      .eq("is_active", true)
      .ilike("name", `%${searchTerm}%`)
      .limit(10)
      .order("sort_order", { ascending: true });

    // Поиск категорий
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, path, level, image_url")
      .eq("is_active", true)
      .ilike("name", `%${searchTerm}%`)
      .limit(10)
      .order("level", { ascending: true })
      .order("sort_order", { ascending: true });

    if (productsError || brandsError || categoriesError) {
      console.error("Search error:", {
        productsError,
        brandsError,
        categoriesError,
      });
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // Обогащаем товары вычисляемыми полями
    const enrichedProducts = (products || []).map((product) => {
      const finalPrice = product.sale_price || product.base_price;
      const isOnSale = !!(
        product.sale_price && product.sale_price < product.base_price
      );
      const discountPercentage = isOnSale
        ? Math.round(
            ((product.base_price - product.sale_price) / product.base_price) *
              100,
          )
        : 0;

      return {
        ...product,
        final_price: finalPrice,
        is_on_sale: isOnSale,
        discount_percentage: discountPercentage,
        formatted_price: formatPrice(
          finalPrice,
          product.currencies?.[0]?.symbol,
        ),
        brand_name: product.brands?.[0]?.name,
        category_name: product.categories?.[0]?.name,
      };
    });

    const totalResults =
      (products?.length || 0) +
      (brands?.length || 0) +
      (categories?.length || 0);

    return NextResponse.json({
      success: true,
      data: {
        products: enrichedProducts,
        brands: brands || [],
        categories: categories || [],
        total: totalResults,
        query: searchTerm,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatPrice(price: number, symbol: string = "₸"): string {
  return `${price.toLocaleString("kk-KZ")} ${symbol}`;
}
