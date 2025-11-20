import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/admin/slides - Получить все слайды
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);
    const sectionType = searchParams.get("section_type");
    const includeInactive = searchParams.get("include_inactive") === "true";

    // Проверка авторизации
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверка роли администратора
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Запрос слайдов
    let query = supabase
      .from("slides")
      .select("*")
      .order("section_type", { ascending: true })
      .order("sort_order", { ascending: true });

    if (sectionType) {
      query = query.eq("section_type", sectionType);
    }

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data: slides, error } = await query;

    if (error) {
      console.error("Error fetching slides:", error);
      return NextResponse.json(
        { error: "Failed to fetch slides" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slides: slides || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/slides:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/slides - Создать новый слайд
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    // Проверка авторизации
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Проверка роли администратора
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Валидация данных
    const {
      section_type,
      image_url,
      alt_text,
      title,
      description,
      catalog_url,
      sizes,
      priority,
      sort_order,
      is_active,
    } = body;

    if (
      !section_type ||
      !image_url ||
      !alt_text ||
      !title ||
      !description ||
      !catalog_url
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["teko", "flexem", "ant"].includes(section_type)) {
      return NextResponse.json(
        { error: "Invalid section_type" },
        { status: 400 }
      );
    }

    // Создание слайда
    const { data: slide, error } = await supabase
      .from("slides")
      .insert({
        section_type,
        image_url,
        alt_text,
        title,
        description,
        catalog_url,
        sizes: sizes || "(max-width: 768px) 100vw, 50vw",
        priority: priority || false,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating slide:", error);
      return NextResponse.json(
        { error: "Failed to create slide" },
        { status: 500 }
      );
    }

    return NextResponse.json({ slide }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/slides:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

