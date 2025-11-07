// src/app/api/admin/users/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabaseServer";
import { UserRole } from "@/lib/services/admin/user";

// Вспомогательная функция для проверки авторизации
async function authorizeAdmin(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authUserError,
  } = await supabase.auth.getUser();

  if (!user || authUserError) {
    console.error("Authentication error:", authUserError?.message);
    return {
      authorized: false,
      response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  // Check user role from user_profiles table
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !["admin", "super_admin"].includes(profile.role)
  ) {
    return {
      authorized: false,
      response: NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { authorized: true, user };
}

// POST /api/admin/users/reset-password - Send password reset link
export async function POST(req: NextRequest) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email обязателен" }, { status: 400 });
  }

  try {
    // ИСПРАВЛЕНИЕ: Изменяем 'password_reset' на 'recovery'
    const { data, error } = await createAdminClient().auth.admin.generateLink({
      type: "recovery", // Правильный тип для сброса пароля
      email: email,
    });

    if (error) {
      console.error("Error generating password reset link:", error);
      return NextResponse.json(
        {
          message: "Не удалось отправить письмо для сброса пароля",
          error: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Инструкции по сбросу пароля отправлены на указанный email." },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(
      "Unexpected error in POST /api/admin/users/reset-password:",
      error,
    );
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера", error: error.message },
      { status: 500 },
    );
  }
}
