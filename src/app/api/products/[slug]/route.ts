import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Product slug is required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // Получаем полную информацию о товаре
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        brands:brand_id(
          id,
          name,
          slug,
          logo_url,
          description,
          website,
          country
        ),
        categories:category_id(
          id,
          name,
          slug,
          path,
          level,
          description,
          image_url
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
          slug,
          description,
          image_url
        ),
        product_variants(
          id,
          name,
          sku,
          price_adjustment,
          inventory_quantity,
          attributes,
          images,
          is_active,
          sort_order
        )
      `,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Увеличиваем счетчик просмотров
    await supabase
      .from("products")
      .update({ view_count: (product.view_count || 0) + 1 })
      .eq("id", product.id);

    // Вычисляем финальную цену и скидку
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

    // Получаем связанные товары из той же категории
    const { data: relatedProducts } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
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
        currencies:currency_id(
          id,
          code,
          symbol
        )
      `,
      )
      .eq("category_id", product.category_id)
      .eq("status", "published")
      .neq("id", product.id)
      .limit(8)
      .order("is_featured", { ascending: false })
      .order("view_count", { ascending: false });

    // Обогащаем связанные товары
    const enrichedRelatedProducts = (relatedProducts || []).map(
      (relatedProduct) => {
        const relatedFinalPrice =
          relatedProduct.sale_price || relatedProduct.base_price;
        const relatedIsOnSale = !!(
          relatedProduct.sale_price &&
          relatedProduct.sale_price < relatedProduct.base_price
        );
        const relatedDiscountPercentage = relatedIsOnSale
          ? Math.round(
              ((relatedProduct.base_price - relatedProduct.sale_price) /
                relatedProduct.base_price) *
                100,
            )
          : 0;

        return {
          ...relatedProduct,
          final_price: relatedFinalPrice,
          is_on_sale: relatedIsOnSale,
          discount_percentage: relatedDiscountPercentage,
          formatted_price: formatPrice(
            relatedFinalPrice,
            relatedProduct.currencies?.[0]?.symbol,
          ),
          brand_name: relatedProduct.brands?.[0]?.name,
        };
      },
    );

    // Обогащаем основной товар
    const enrichedProduct = {
      ...product,
      final_price: finalPrice,
      is_on_sale: isOnSale,
      discount_percentage: discountPercentage,
      formatted_price: formatPrice(finalPrice, product.currencies?.[0]?.symbol),
      brand_name: product.brands?.[0]?.name,
      category_name: product.categories?.[0]?.name,
      view_count: (product.view_count || 0) + 1,
    };

    return NextResponse.json({
      success: true,
      data: {
        product: enrichedProduct,
        relatedProducts: enrichedRelatedProducts,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatPrice(price: number, symbol: string = "₸"): string {
  return `${price.toLocaleString("ru-RU")} ${symbol}`;
}
