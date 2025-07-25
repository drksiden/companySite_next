import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Получаем продукт со всеми связанными данными
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug,
          description,
          image_url
        ),
        brand:brands(
          id,
          name,
          slug,
          description,
          logo_url,
          website
        ),
        collection:collections(
          id,
          name,
          slug,
          description,
          image_url
        ),
        currency:currencies(
          id,
          code,
          name,
          symbol
        ),
        variants:product_variants(
          id,
          name,
          sku,
          barcode,
          price_adjustment,
          inventory_quantity,
          attributes,
          images,
          is_active,
          sort_order
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Вычисляем дополнительные поля
    const enrichedProduct = {
      ...product,
      final_price: product.sale_price || product.base_price,
      is_on_sale: !!(product.sale_price && product.sale_price < product.base_price),
      discount_percentage: product.sale_price && product.base_price
        ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
        : 0,
      formatted_price: formatPrice(
        product.sale_price || product.base_price,
        product.currency?.code || 'KZT'
      ),
    };

    // Увеличиваем счетчик просмотров
    await supabase
      .from('products')
      .update({ view_count: (product.view_count || 0) + 1 })
      .eq('id', product.id);

    return NextResponse.json({
      success: true,
      data: enrichedProduct,
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatPrice(price: number, currencyCode: string = 'KZT'): string {
  const currency = currencyCode || 'KZT';
  const symbol = currency === 'KZT' ? '₸' : currency === 'USD' ? '$' : '₽';
  return `${price.toLocaleString('ru-RU')} ${symbol}`;
}
