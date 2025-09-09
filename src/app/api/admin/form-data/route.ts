import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "categories":
        return getCategoriesData(supabase);
      case "brands":
        return getBrandsData(supabase);
      case "collections":
        return getCollectionsData(supabase);
      case "currencies":
        return getCurrenciesData(supabase);
      case "all":
      case null:
      default:
        return getAllFormData(supabase);
    }
  } catch (error) {
    console.error("Error in form-data API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function getCategoriesData(supabase: any) {
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, path, level, parent_id, is_active")
    .eq("is_active", true)
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }

  return NextResponse.json({ categories: categories || [] });
}

async function getBrandsData(supabase: any) {
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 },
    );
  }

  return NextResponse.json({ brands: brands || [] });
}

async function getCollectionsData(supabase: any) {
  const { data: collections, error } = await supabase
    .from("collections")
    .select(
      `
      id,
      name,
      slug,
      brand_id,
      category_id,
      is_active,
      brands!inner (
        id,
        name
      ),
      categories!inner (
        id,
        name
      )
    `,
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }

  return NextResponse.json({ collections: collections || [] });
}

async function getCurrenciesData(supabase: any) {
  const { data: currencies, error } = await supabase
    .from("currencies")
    .select("id, code, name, symbol, is_base, is_active")
    .eq("is_active", true)
    .order("is_base", { ascending: false })
    .order("code", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch currencies" },
      { status: 500 },
    );
  }

  return NextResponse.json({ currencies: currencies || [] });
}

async function getAllFormData(supabase: any) {
  try {
    const [
      categoriesResult,
      brandsResult,
      collectionsResult,
      currenciesResult,
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug, path, level, parent_id, is_active")
        .eq("is_active", true)
        .order("level", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("brands")
        .select("id, name, slug, logo_url, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("collections")
        .select(
          `
          id,
          name,
          slug,
          brand_id,
          category_id,
          is_active,
          brands!inner (
            id,
            name
          ),
          categories!inner (
            id,
            name
          )
        `,
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("currencies")
        .select("id, code, name, symbol, is_base, is_active")
        .eq("is_active", true)
        .order("is_base", { ascending: false })
        .order("code", { ascending: true }),
    ]);

    // Check for errors
    if (categoriesResult.error) throw new Error("Failed to fetch categories");
    if (brandsResult.error) throw new Error("Failed to fetch brands");
    if (collectionsResult.error) throw new Error("Failed to fetch collections");
    if (currenciesResult.error) throw new Error("Failed to fetch currencies");

    return NextResponse.json({
      categories: categoriesResult.data || [],
      brands: brandsResult.data || [],
      collections: collectionsResult.data || [],
      currencies: currenciesResult.data || [],
    });
  } catch (error) {
    console.error("Error fetching all form data:", error);
    return NextResponse.json(
      { error: "Failed to fetch form data" },
      { status: 500 },
    );
  }
}
