import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import type { CatalogProduct } from "@/lib/services/catalog";

export const revalidate = 300; // Revalidate every 5 minutes

async function getProductsByCategory(slugs: string[]): Promise<CatalogProduct[]> {
  const supabase = await createServerClient();

  // Получаем все категории для поиска дочерних
  const { data: allCategories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, parent_id, slug, level")
    .eq("is_active", true);

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError.message);
    return [];
  }

  // Находим категорию по цепочке slugs
  let parentId: string | null = null;
  let categoryId: string | null = null;

  for (let idx = 0; idx < slugs.length; idx++) {
    const slug = slugs[idx];
    let query = supabase
      .from("categories")
      .select("id, parent_id, level")
      .eq("slug", slug)
      .eq("is_active", true);

    if (idx === 0) {
      query = query.eq("level", 0).is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return [];
    }

    parentId = data.id;
    if (idx === slugs.length - 1) {
      categoryId = data.id;
    }
  }

  if (!categoryId) {
    return [];
  }

  // Создаем Set с начальной категорией и рекурсивно находим все дочерние
  const expandedCategories = new Set<string>([categoryId]);

  const findChildren = (parentId: string) => {
    allCategories?.forEach((cat: { id: string; parent_id: string | null }) => {
      if (cat.parent_id === parentId) {
        expandedCategories.add(cat.id);
        findChildren(cat.id);
      }
    });
  };

  findChildren(categoryId);

  // Получаем товары из всех категорий (включая дочерние)
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      brand:brands (id, name, slug)
    `
    )
    .in("category_id", Array.from(expandedCategories))
    .eq("status", "active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Трансформируем данные в формат CatalogProduct
  return data.map((product: any) => {
    // Обработка изображений
    let images: string[] = [];
    if (product.images) {
      if (Array.isArray(product.images)) {
        images = product.images
          .map((img: any) => {
            if (typeof img === "string") return img.trim();
            if (typeof img === "object" && img?.url) return img.url.trim();
            return null;
          })
          .filter((url: any): url is string => 
            url && typeof url === "string" && url.length > 0
          );
      } else if (typeof product.images === "string") {
        try {
          const parsed = JSON.parse(product.images);
          if (Array.isArray(parsed)) {
            images = parsed
              .map((img: any) => typeof img === "string" ? img : img?.url)
              .filter(Boolean);
          }
        } catch {
          images = [product.images];
        }
      }
    }

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      short_description: product.short_description,
      description: product.description,
      base_price: product.base_price || 0,
      sale_price: product.sale_price,
      thumbnail: product.thumbnail,
      images: images,
      inventory_quantity: product.inventory_quantity || 0,
      track_inventory: product.track_inventory || false,
      is_featured: product.is_featured || false,
      status: product.status || "active",
      created_at: product.created_at,
      view_count: product.view_count || 0,
      sales_count: product.sales_count || 0,
      brands: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug,
      } : null,
      categories: null, // Можно добавить если нужно
    } as CatalogProduct;
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slugs: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const slugs = resolvedParams.slugs || [];

    if (!slugs || slugs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category slugs required" },
        { status: 400 }
      );
    }

    const products = await getProductsByCategory(slugs);

    return NextResponse.json(
      {
        success: true,
        data: products,
        meta: {
          total: products.length,
          page: 1,
          limit: products.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Category products API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

