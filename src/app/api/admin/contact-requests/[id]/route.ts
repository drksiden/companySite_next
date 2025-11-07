import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabaseServer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Статус не указан" },
        { status: 400 }
      );
    }

    const validStatuses = ["new", "in_progress", "completed", "closed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Неверный статус" },
        { status: 400 }
      );
    }

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

    // Обновляем статус запроса
    const { data, error } = await supabase
      .from("client_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact request:", error);
      return NextResponse.json(
        { error: "Ошибка при обновлении запроса" },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: data }, { status: 200 });
  } catch (error) {
    console.error("Error in contact request update API:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

