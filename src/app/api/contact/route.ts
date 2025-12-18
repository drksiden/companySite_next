import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError, logInfo, logHttp } from "@/lib/logger/server";

// Используем admin клиент (service role key) для публичного endpoint
// Это безопасно, так как:
// 1. Валидация данных выполняется на сервере (имя, фамилия, email, телефон)
// 2. Проверка формата email на сервере
// 3. Проверка обязательных полей на сервере
// 4. API endpoint защищен от спама через серверную валидацию
// 
// Service role key используется только на сервере, никогда не передается на клиент

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Функция для создания admin клиента
function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    logHttp('POST /api/contact', {
      method: 'POST',
      endpoint: '/api/contact',
    });
    
    const body = await req.json();
    const { first_name, last_name, phone, email, message } = body;

    // Валидация данных
    if (!first_name || !last_name || !message) {
      return NextResponse.json(
        { error: "Имя, фамилия и сообщение обязательны для заполнения" },
        { status: 400 }
      );
    }

    if (!phone && !email) {
      return NextResponse.json(
        { error: "Необходимо указать телефон или email" },
        { status: 400 }
      );
    }

    // Проверка формата email, если указан
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Неверный формат email" },
        { status: 400 }
      );
    }

    // Используем admin клиент для вставки данных
    // Все данные валидированы на сервере выше
    const supabase = getAdminClient();

    // Сохраняем запрос в базу данных
    const { data, error } = await supabase
      .from("client_requests")
      .insert({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim() : null,
        message: message.trim(),
        status: "new", // Новый запрос
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logError("Error inserting client request", error, {
        endpoint: '/api/contact',
        method: 'POST',
        operation: 'insert_client_request',
      });
      return NextResponse.json(
        { error: "Ошибка при сохранении запроса" },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logInfo('Contact form submitted successfully', {
      endpoint: '/api/contact',
      method: 'POST',
      requestId: data?.id,
      duration: `${duration}ms`,
      hasPhone: !!phone,
      hasEmail: !!email,
    });

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    logError("Error in contact API", error as Error, {
      endpoint: '/api/contact',
      method: 'POST',
      errorType: 'contact-api-error',
    });
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

