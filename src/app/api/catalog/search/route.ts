import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { formatPrice } from "@/lib/utils";

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

    const supabase = await createServerClient();
    const searchTerm = query.trim();

    // Нормализация поискового запроса: создаем варианты с разными разделителями
    // Это позволяет находить "астра-2131" при поиске "астра 2131" и наоборот
    const normalizeSearchTerm = (term: string): string[] => {
      const variants = new Set<string>();
      
      // Оригинальный запрос
      variants.add(term);
      
      // Заменяем пробелы на дефисы
      variants.add(term.replace(/\s+/g, '-'));
      
      // Заменяем дефисы на пробелы
      variants.add(term.replace(/-+/g, ' '));
      
      // Убираем все пробелы и дефисы
      variants.add(term.replace(/[\s-]+/g, ''));
      
      // Заменяем пробелы и дефисы на подстановочный символ для гибкого поиска
      const flexible = term.replace(/[\s-]+/g, '%');
      if (flexible !== term) {
        variants.add(flexible);
      }
      
      return Array.from(variants);
    };

    const searchVariants = normalizeSearchTerm(searchTerm);
    
    // Создаем условия поиска для всех вариантов
    const buildSearchConditions = (field: string, variants: string[]): string => {
      return variants
        .map(v => `${field}.ilike.%${v}%`)
        .join(',');
    };

    const productSearchConditions = [
      buildSearchConditions('name', searchVariants),
      buildSearchConditions('short_description', searchVariants),
      buildSearchConditions('sku', searchVariants),
      buildSearchConditions('description', searchVariants),
    ].join(',');

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
        images,
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
      .in("status", ["active", "made_to_order"])
      .or(productSearchConditions)
      .limit(limit)
      .order("is_featured", { ascending: false })
      .order("view_count", { ascending: false });

    // Поиск брендов с нормализацией
    const brandSearchConditions = buildSearchConditions('name', searchVariants);
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select("id, name, slug, logo_url")
      .eq("is_active", true)
      .or(brandSearchConditions)
      .limit(10)
      .order("sort_order", { ascending: true });

    // Поиск категорий с нормализацией
    const categorySearchConditions = buildSearchConditions('name', searchVariants);
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, slug, path, level, image_url")
      .eq("is_active", true)
      .or(categorySearchConditions)
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
