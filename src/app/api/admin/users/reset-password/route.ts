// src/app/api/admin/users/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { UserRole } from '@/lib/services/user'; // Assuming UserRole is defined here or in a common types file

// Вспомогательная функция для проверки авторизации (повторно используем из предыдущих файлов)
async function authorizeAdmin(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: authUserError } = await supabase.auth.getUser();

  if (!user || authUserError) {
    console.error('Authentication error:', authUserError?.message);
    return { authorized: false, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  // Предполагается, что роль 'admin' хранится в app_metadata пользователя
  if (user.app_metadata.role !== 'admin') {
    return { authorized: false, response: NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 }) };
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
    return NextResponse.json({ message: 'Email обязателен' }, { status: 400 });
  }

  try {
    // ИСПРАВЛЕНИЕ: Изменяем 'password_reset' на 'recovery'
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery', // Правильный тип для сброса пароля
      email: email,
    });

    if (error) {
      console.error('Error generating password reset link:', error);
      return NextResponse.json({ message: 'Не удалось отправить письмо для сброса пароля', error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Инструкции по сбросу пароля отправлены на указанный email.' }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/users/reset-password:', error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера', error: error.message }, { status: 500 });
  }
}