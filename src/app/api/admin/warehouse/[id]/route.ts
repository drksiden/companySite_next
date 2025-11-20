import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/admin/warehouse/[id] - Получить позицию склада по ID
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

    // Проверка роли
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: item, error } = await supabase
      .from("warehouse_inventory")
      .select(`
        *,
        product:products(
          id,
          name,
          slug,
          sku,
          thumbnail,
          images,
          category_id,
          brand_id,
          collection_id,
          inventory_quantity,
          track_inventory,
          category:categories(name),
          brand:brands(name)
        ),
        assigned_user:user_profiles!warehouse_inventory_assigned_to_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching warehouse item:", error);
      return NextResponse.json(
        { error: "Failed to fetch warehouse item" },
        { status: 500 }
      );
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error in GET /api/admin/warehouse/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/warehouse/[id] - Обновить позицию склада
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

    // Проверка роли
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Валидация данных
    if (body.status && !["available", "in_use", "maintenance", "reserved", "sold", "written_off"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Обновление позиции склада
    const updateData: any = {};
    if (body.product_id !== undefined) updateData.product_id = body.product_id;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.reserved_quantity !== undefined) updateData.reserved_quantity = body.reserved_quantity;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to || null;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.last_counted_at !== undefined) updateData.last_counted_at = body.last_counted_at;

    const { data: item, error } = await supabase
      .from("warehouse_inventory")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        product:products(
          id,
          name,
          slug,
          sku,
          thumbnail,
          images,
          category_id,
          brand_id,
          collection_id,
          inventory_quantity,
          track_inventory,
          category:categories(name),
          brand:brands(name)
        ),
        assigned_user:user_profiles!warehouse_inventory_assigned_to_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error("Error updating warehouse item:", error);
      return NextResponse.json(
        { error: "Failed to update warehouse item" },
        { status: 500 }
      );
    }

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error in PUT /api/admin/warehouse/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/warehouse/[id] - Удалить позицию склада
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

    // Проверка роли
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("warehouse_inventory")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting warehouse item:", error);
      return NextResponse.json(
        { error: "Failed to delete warehouse item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/admin/warehouse/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

