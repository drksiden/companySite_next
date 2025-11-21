import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabaseServer";

// GET - получить общие настройки
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    const { data: settings, error } = await adminSupabase
      .from("display_settings")
      .select("*")
      .eq("setting_key", "general")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching general settings:", error);
      return NextResponse.json(
        { error: "Ошибка при получении настроек" },
        { status: 500 }
      );
    }

    const defaultSettings = {
      siteName: "Мой интернет-магазин",
      siteDescription: "Лучшие товары по доступным ценам",
      siteUrl: "https://mystore.kz",
      contactEmail: "info@mystore.kz",
      contactPhone: "+7 777 123 4567",
      timezone: "Asia/Almaty",
      currency: "KZT",
      language: "ru",
      maintenanceMode: false,
    };

    return NextResponse.json({
      success: true,
      settings: settings?.setting_value || defaultSettings,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/settings/general:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST - сохранить общие настройки
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Неверный формат настроек" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("display_settings")
      .upsert(
        {
          setting_key: "general",
          setting_value: settings,
          description: "Общие настройки сайта",
        },
        {
          onConflict: "setting_key",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving general settings:", error);
      return NextResponse.json(
        { error: "Ошибка при сохранении настроек" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data.setting_value,
    });
  } catch (error) {
    console.error("Error in POST /api/admin/settings/general:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

