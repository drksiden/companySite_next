import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseServer";

// Публичный GET - получить настройки отображения (без авторизации, для фронтенда)
export async function GET(req: NextRequest) {
  try {
    const adminSupabase = createAdminClient();

    // Получаем настройки отображения
    const { data: settings, error } = await adminSupabase
      .from("display_settings")
      .select("*")
      .eq("setting_key", "product_display")
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching display settings:", error);
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
    console.error("Error in GET /api/settings/display:", error);
    // В случае ошибки возвращаем настройки по умолчанию
    return NextResponse.json({
      success: true,
      settings: {
        show_stock_status: true,
        show_quantity: true,
        show_made_to_order: true,
        made_to_order_text: "На заказ",
        in_stock_text: "В наличии",
        out_of_stock_text: "Нет в наличии",
        low_stock_threshold: 5,
        show_low_stock_warning: true,
        low_stock_text: "Осталось мало",
      },
    });
  }
}

