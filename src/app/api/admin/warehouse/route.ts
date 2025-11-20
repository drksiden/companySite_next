import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

// GET /api/admin/warehouse - Получить все позиции склада
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

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

    // Параметры фильтрации
    const search = searchParams.get("search");
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const assignedTo = searchParams.get("assigned_to");
    const includeInactive = searchParams.get("include_inactive") === "true";

    // Запрос позиций склада с информацией о товарах
    let query = supabase
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
      .order("created_at", { ascending: false });

    // Применяем фильтры
    if (search) {
      query = query.or(
        `product.name.ilike.%${search}%,product.sku.ilike.%${search}%`
      );
    }

    if (location && location !== "all") {
      query = query.eq("location", location);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (category && category !== "all") {
      query = query.eq("product.category_id", category);
    }

    if (assignedTo && assignedTo !== "all") {
      query = query.eq("assigned_to", assignedTo);
    }

    const { data: items, error } = await query;

    if (error) {
      console.error("Error fetching warehouse items:", error);
      return NextResponse.json(
        { error: "Failed to fetch warehouse items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: items || [] });
  } catch (error) {
    console.error("Error in GET /api/admin/warehouse:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/warehouse - Создать новую позицию склада
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
    const {
      product_id,
      location,
      quantity,
      reserved_quantity,
      status,
      assigned_to,
      notes,
    } = body;

    if (!product_id || !location || status === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: product_id, location, status" },
        { status: 400 }
      );
    }

    if (
      !["available", "in_use", "maintenance", "reserved", "sold", "written_off"].includes(
        status
      )
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Проверяем, существует ли уже запись для этого товара в этом месте
    const { data: existing } = await supabase
      .from("warehouse_inventory")
      .select("id, quantity")
      .eq("product_id", product_id)
      .eq("location", location)
      .single();

    let item;
    if (existing) {
      // Обновляем существующую запись
      const { data: updated, error: updateError } = await supabase
        .from("warehouse_inventory")
        .update({
          quantity: quantity !== undefined ? quantity : existing.quantity,
          reserved_quantity: reserved_quantity !== undefined ? reserved_quantity : 0,
          status,
          assigned_to: assigned_to || null,
          notes,
          last_counted_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
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
      
      if (updateError) throw updateError;
      item = updated;
    } else {
      // Создаем новую запись
      const { data: created, error: createError } = await supabase
        .from("warehouse_inventory")
        .insert({
          product_id,
          location,
          quantity: quantity || 0,
          reserved_quantity: reserved_quantity || 0,
          status,
          assigned_to: assigned_to || null,
          notes,
          last_counted_at: new Date().toISOString(),
        })
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
      
      if (createError) {
        console.error("Error creating warehouse item:", createError);
        return NextResponse.json(
          { error: "Failed to create warehouse item" },
          { status: 500 }
        );
      }
      item = created;
    }

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/admin/warehouse:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

