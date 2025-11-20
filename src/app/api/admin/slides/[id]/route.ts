import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/admin/slides/[id] - Получить слайд по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

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

    const { data: slide, error } = await supabase
      .from("slides")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching slide:", error);
      return NextResponse.json(
        { error: "Failed to fetch slide" },
        { status: 500 }
      );
    }

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Error in GET /api/admin/slides/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/slides/[id] - Обновить слайд
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;
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
    if (body.section_type && !["teko", "flexem", "ant"].includes(body.section_type)) {
      return NextResponse.json(
        { error: "Invalid section_type" },
        { status: 400 }
      );
    }

    // Обновление слайда
    const updateData: any = {};
    if (body.section_type !== undefined) updateData.section_type = body.section_type;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.alt_text !== undefined) updateData.alt_text = body.alt_text;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.catalog_url !== undefined) updateData.catalog_url = body.catalog_url;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: slide, error } = await supabase
      .from("slides")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating slide:", error);
      return NextResponse.json(
        { error: "Failed to update slide" },
        { status: 500 }
      );
    }

    if (!slide) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    return NextResponse.json({ slide });
  } catch (error) {
    console.error("Error in PUT /api/admin/slides/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/slides/[id] - Удалить слайд
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    const { id } = await params;

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

    const { error } = await supabase.from("slides").delete().eq("id", id);

    if (error) {
      console.error("Error deleting slide:", error);
      return NextResponse.json(
        { error: "Failed to delete slide" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/slides/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

