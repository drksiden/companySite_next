import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { formatPrice } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();

    // Получаем информацию о товаре по ID
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        sku,
        short_description,
        description,
        base_price,
        sale_price,
        thumbnail,
        images,
        inventory_quantity,
        track_inventory,
        is_featured,
        status,
        created_at,
        view_count,
        sales_count,
        brands:brand_id(
          id,
          name,
          slug,
          logo_url
        ),
        categories:category_id(
          id,
          name,
          slug,
          path,
          level
        ),
        currencies:currency_id(
          id,
          code,
          symbol,
          name
        ),
        collections:collection_id(
          id,
          name,
          slug
        )
      `,
      )
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Обработка изображений
    const productImages = product.images
      ? (Array.isArray(product.images) ? product.images : []).filter(
          (img: any) => img && typeof img === "string" && img.trim() !== "",
        )
      : [];

    const productThumbnail =
      product.thumbnail && product.thumbnail.trim() !== ""
        ? product.thumbnail
        : productImages.length > 0
          ? productImages[0]
          : null;

    // Вычисляем финальную цену
    const finalPrice = product.sale_price || product.base_price;
    const isOnSale = !!(
      product.sale_price && product.sale_price < product.base_price
    );

    // Обработка связанных данных (могут быть массивами)
    const processedProduct = {
      ...product,
      thumbnail: productThumbnail,
      images: productImages,
      brands: Array.isArray(product.brands) ? product.brands[0] || null : product.brands,
      categories: Array.isArray(product.categories) ? product.categories[0] || null : product.categories,
      currencies: Array.isArray(product.currencies) ? product.currencies[0] || null : product.currencies,
      collections: Array.isArray(product.collections) ? product.collections[0] || null : product.collections,
    };

    return NextResponse.json({
      success: true,
      product: processedProduct,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

