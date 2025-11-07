import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Проверка авторизации
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Необходима авторизация" },
        { status: 401 }
      );
    }

    // Получаем все запросы клиентов
    const { data, error } = await supabase
      .from("client_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching contact requests:", error);
      return NextResponse.json(
        { error: "Ошибка при получении запросов" },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: data || [] }, { status: 200 });
  } catch (error) {
    console.error("Error in contact requests API:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

