import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Параметры пагинации
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    // Параметры фильтрации
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const brands = searchParams.get("brands")?.split(",").filter(Boolean) || [];
    const collections =
      searchParams.get("collections")?.split(",").filter(Boolean) || [];
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
    const inStockOnly = searchParams.get("inStockOnly") === "true";
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("search");

    // Параметры сортировки
    const sortBy = searchParams.get("sortBy") || "name_asc";

    const supabase = await createClient();

    // Базовый запрос
    let query = supabase
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
        status,
        created_at,
        brand:brands(
          id,
          name,
          slug
        ),
        category:categories(
          id,
          name,
          slug
        ),
        currency:currencies(
          id,
          code,
          symbol
        )
      `,
        { count: "exact" },
      )
      .eq("status", "active");

    // Применяем фильтры
    if (categories.length > 0) {
      query = query.in("category_id", categories);
    }

    if (brands.length > 0) {
      query = query.in("brand_id", brands);
    }

    if (collections.length > 0) {
      query = query.in("collection_id", collections);
    }

    if (minPrice > 0) {
      query = query.gte("base_price", minPrice);
    }

    if (maxPrice > 0) {
      query = query.lte("base_price", maxPrice);
    }

    if (inStockOnly) {
      query = query.gt("inventory_quantity", 0);
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Применяем сортировку
    switch (sortBy) {
      case "name_asc":
        query = query.order("name", { ascending: true });
        break;
      case "name_desc":
        query = query.order("name", { ascending: false });
        break;
      case "price_asc":
        query = query.order("base_price", {
          ascending: true,
          nullsFirst: true,
        });
        break;
      case "price_desc":
        query = query.order("base_price", {
          ascending: false,
          nullsFirst: true,
        });
        break;
      case "created_asc":
        query = query.order("created_at", { ascending: true });
        break;
      case "created_desc":
        query = query.order("created_at", { ascending: false });
        break;
      case "featured":
        query = query.order("is_featured", { ascending: false }).order("name");
        break;
      default:
        query = query.order("name", { ascending: true });
    }

    // Применяем пагинацию
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Обогащаем продукты вычисляемыми полями
    const products = (data || []).map((product) => {
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
        formatted_price: formatPrice(finalPrice),
      };
    });

    const totalPages = Math.ceil((count || 0) / limit);

    const response = {
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        categories: categories,
        brands: brands,
        collections: collections,
        priceRange: { min: minPrice, max: maxPrice },
        inStockOnly,
        featured,
        search,
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ₸`;
}
