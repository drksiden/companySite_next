import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();

  // Получаем текущего пользователя
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Получаем роль из user_profiles
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!["admin", "manager", "super_admin"].includes(profile.role)) {
    return NextResponse.json(
      { message: "Forbidden: Admin access required" },
      { status: 403 },
    );
  }

  // Получаем список пользователей из user_profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { message: "Error fetching user profiles", error: profilesError.message },
      { status: 500 },
    );
  }
  return NextResponse.json(profiles, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    // Для админ-операций используем supabaseAdmin (service_role key)
    // Но для проверки прав используем обычный supabase (по кукам)
    const supabaseAdmin = createAdminClient();
    const supabase = await createServerClient();

    // Проверка прав (только админ/менеджер/суперадмин)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (
      !profile ||
      !["admin", "manager", "super_admin"].includes(profile.role)
    ) {
      return NextResponse.json(
        { message: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    // Получаем данные из тела запроса
    const body = await req.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      avatar_url,
      role,
      is_active,
      client_type,
      company_id,
      position,
    } = body;
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email и пароль обязательны." },
        { status: 400 },
      );
    }

    // Создаём пользователя в Supabase Auth через supabaseAdmin
    const { data: signUpData, error: signUpError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name,
          last_name,
          phone,
          avatar_url,
        },
        app_metadata: {
          role: role || "customer",
        },
      });
    if (signUpError) {
      return NextResponse.json(
        {
          message: "Ошибка создания пользователя в Auth",
          error: signUpError.message,
          details: signUpError,
          supabaseKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
          email,
          passwordLength: password?.length,
        },
        { status: 500 },
      );
    }
    const newUserId = signUpData.user?.id;
    if (!newUserId) {
      return NextResponse.json(
        { message: "Не удалось получить ID нового пользователя." },
        { status: 500 },
      );
    }

    // Создаём профиль пользователя в user_profiles
    const profilePayload = {
      id: newUserId,
      email,
      first_name,
      last_name,
      phone,
      avatar_url,
      role: role || "customer",
      is_active: is_active ?? true,
      client_type: client_type || "individual",
      company_id: company_id || null,
      position: position || null,
    };

    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .insert(profilePayload)
      .select()
      .single();

    if (profileError) {
      // Если создание профиля не удалось, откатываем создание пользователя в Auth
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json(
        {
          message:
            "Ошибка создания профиля пользователя. Пользователь в Auth был удален.",
          error: profileError.message,
          details: profileError,
        },
        { status: 500 },
      );
    }

    // Возвращаем созданный профиль
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Ошибка сервера.",
        error: error,
        stack: error?.stack,
        env: {
          SUPABASE_SERVICE_ROLE_KEY: Boolean(
            process.env.SUPABASE_SERVICE_ROLE_KEY,
          ),
          NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        },
      },
      { status: 500 },
    );
  }
}
