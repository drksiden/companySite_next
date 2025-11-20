import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";
import { uploadFileToR2 } from "@/lib/r2";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const isActive = searchParams.get("is_active");

    // Build query
    let query = supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isActive !== null && isActive !== "all") {
      query = query.eq("is_active", isActive === "true");
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: brands, error } = await query;

    if (error) {
      console.error("Error fetching brands:", error);
      return NextResponse.json(
        { error: "Failed to fetch brands" },
        { status: 500 },
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from("brands")
      .select("*", { count: "exact", head: true });

    if (search) {
      countQuery = countQuery.or(
        `name.ilike.%${search}%,description.ilike.%${search}%`,
      );
    }

    if (isActive !== null && isActive !== "all") {
      countQuery = countQuery.eq("is_active", isActive === "true");
    }

    const { count } = await countQuery;

    return NextResponse.json({
      brands: brands || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("Error in brands GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();

    // --- Обработка логотипа ---
    const logoFile = formData.get("logoFile") as File;
    let logoUrl = null;

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadFileToR2(logoFile, "images/brands");
    }

    // --- Сборка данных для создания ---
    const insertData: { [key: string]: unknown } = {};

    for (const [key, value] of formData.entries()) {
      // Исключаем поле логотипа, которое мы обрабатываем вручную
      if (key === "logoFile") continue;

      if (typeof value === "string") {
        switch (key) {
          case "sort_order":
            insertData[key] = value ? parseInt(value) : 0;
            break;
          case "is_active":
            insertData[key] = value === "true";
            break;
          default:
            insertData[key] = value || null;
            break;
        }
      }
    }

    // Добавляем URL логотипа
    if (logoUrl) {
      insertData.logo_url = logoUrl;
    }

    // Генерируем slug из названия, если не указан
    if (!insertData.slug && insertData.name) {
      insertData.slug = (insertData.name as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    // Сохранение в Supabase
    const { data, error } = await supabase
      .from("brands")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData();

    const brandId = formData.get("id") as string;
    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 },
      );
    }

    // --- Обработка логотипа ---
    const logoFile = formData.get("logoFile") as File;
    const existingLogoUrl = formData.get("existingLogoUrl") as string;
    let logoUrl = existingLogoUrl;

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadFileToR2(logoFile, "images/brands");
    }

    // --- Сборка данных для обновления ---
    const updateData: { [key: string]: unknown } = {};

    for (const [key, value] of formData.entries()) {
      // Исключаем поля, которые мы обрабатываем вручную
      if (["id", "logoFile", "existingLogoUrl"].includes(key)) continue;

      if (typeof value === "string") {
        switch (key) {
          case "sort_order":
            updateData[key] = value ? parseInt(value) : 0;
            break;
          case "is_active":
            updateData[key] = value === "true";
            break;
          default:
            updateData[key] = value || null;
            break;
        }
      }
    }

    // Обновляем URL логотипа
    if (logoUrl) {
      updateData.logo_url = logoUrl;
    }

    // Обновление в Supabase
    const { data, error } = await supabase
      .from("brands")
      .update(updateData)
      .eq("id", brandId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error in PUT:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("id");

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID is required" },
        { status: 400 },
      );
    }

    // Проверяем, есть ли связанные продукты
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId);

    if (productsCount && productsCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand. There are ${productsCount} products associated with this brand.`,
        },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("brands").delete().eq("id", brandId);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error in DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
