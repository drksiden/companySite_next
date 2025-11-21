import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabaseServer";

// GET - получить настройки отображения
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Проверяем авторизацию
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверяем роль пользователя
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const adminSupabase = createAdminClient();

    // Получаем ключ из query параметров (по умолчанию product_display)
    const { searchParams } = new URL(req.url);
    const settingKey = searchParams.get("key") || "product_display";

    // Получаем настройки
    const { data: settings, error } = await adminSupabase
      .from("display_settings")
      .select("*")
      .eq("setting_key", settingKey)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching display settings:", error);
      return NextResponse.json(
        { error: "Ошибка при получении настроек" },
        { status: 500 }
      );
    }

    // Если настроек нет, возвращаем значения по умолчанию
    const defaultSettings = {
      show_stock_status: true,
      show_quantity: true,
      show_made_to_order: true,
      made_to_order_text: "На заказ",
      in_stock_text: "В наличии",
      out_of_stock_text: "Нет в наличии",
      low_stock_threshold: 5,
      show_low_stock_warning: true,
      low_stock_text: "Осталось мало",
    };

    return NextResponse.json({
      success: true,
      settings: settings?.setting_value || defaultSettings,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/settings/display:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// POST/PUT - сохранить настройки отображения
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Проверяем авторизацию
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    // Проверяем роль пользователя
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "super_admin"].includes(profile.role)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await req.json();
    const { settings, setting_key } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Неверный формат настроек" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Определяем ключ настроек (по умолчанию product_display)
    const key = setting_key || "product_display";
    const descriptions: Record<string, string> = {
      product_display: "Настройки отображения статусов товаров",
      notifications: "Настройки уведомлений",
      payments: "Настройки оплаты",
      shipping: "Настройки доставки",
    };

    // Сохраняем или обновляем настройки
    const { data, error } = await adminSupabase
      .from("display_settings")
      .upsert(
        {
          setting_key: key,
          setting_value: settings,
          description: descriptions[key] || "Настройки",
        },
        {
          onConflict: "setting_key",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving display settings:", error);
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
    console.error("Error in POST /api/admin/settings/display:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

