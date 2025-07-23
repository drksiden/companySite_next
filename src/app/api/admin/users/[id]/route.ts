// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { UserProfile, UserUpdatePayload, UserRole } from '@/lib/services/user'; // Убедитесь, что UserUpdatePayload и UserRole импортированы
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Вспомогательная функция для проверки авторизации
async function authorizeAdmin(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies: () => cookies() });
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

// GET /api/admin/users/[id] - Получить профиль пользователя по ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id } = params;

  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') { // No rows found
        return NextResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
      }
      console.error(`Error fetching user profile with ID ${id}:`, profileError);
      return NextResponse.json({ message: 'Ошибка получения профиля пользователя', error: profileError.message }, { status: 500 });
    }

    return NextResponse.json(profile as UserProfile, { status: 200 });

  } catch (error: any) {
    console.error(`Unexpected error in GET /api/admin/users/${id}:`, error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера', error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - Обновить профиль пользователя по ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id } = params;
  // ИСПРАВЛЕНИЕ: Читаем весь JSON-запрос и явно отделяем поля для auth.admin.updateUserById
  const requestBody: Partial<UserProfile & { email?: string; role?: UserRole }> = await req.json();
  const { email: newEmail, role: newRole, ...profileUpdates } = requestBody;

  if (Object.keys(requestBody).length === 0) {
    return NextResponse.json({ message: 'Отсутствуют данные для обновления.' }, { status: 400 });
  }

  try {
    // 1. Обновляем профиль пользователя в таблице 'profiles'
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates) // profileUpdates теперь не содержит email и role
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      console.error(`Error updating user profile with ID ${id}:`, profileError);
      return NextResponse.json({ message: 'Ошибка обновления профиля пользователя', error: profileError.message }, { status: 500 });
    }

    if (!updatedProfile) {
      return NextResponse.json({ message: 'Профиль пользователя не найден для обновления.' }, { status: 404 });
    }

    // 2. Если обновляется роль, обновляем app_metadata в auth.users
    if (newRole) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        app_metadata: { role: newRole }
      });
      if (authUpdateError) {
        console.error(`Error updating auth user role for ID ${id}:`, authUpdateError);
        // Не возвращаем ошибку, если это не критично, но логируем.
        // Можно добавить более строгую обработку, если это критично.
      }
    }
    
    // 3. Если обновляется email, обновляем в auth.users
    if (newEmail) {
      const { error: authEmailUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        email: newEmail,
        email_confirm: true, // Возможно, захотите подтверждать email администратором
      });
      if (authEmailUpdateError) {
        console.error(`Error updating auth user email for ID ${id}:`, authEmailUpdateError);
        return NextResponse.json({ message: `Ошибка обновления email пользователя: ${authEmailUpdateError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json(updatedProfile, { status: 200 });

  } catch (error: any) {
    console.error(`Unexpected error in PATCH /api/admin/users/${id}:`, error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера', error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Удалить пользователя по ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { id } = params;

  try {
    // Удаляем пользователя из Supabase Auth.
    // Если у вас настроен внешний ключ с ON DELETE CASCADE между auth.users.id и profiles.id,
    // это автоматически удалит запись из таблицы profiles.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      console.error(`Error deleting auth user with ID ${id}:`, authError);
      if (authError.message.includes('not found')) {
        return NextResponse.json({ message: 'Пользователь не найден для удаления.' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Ошибка удаления пользователя', error: authError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Пользователь успешно удален' }, { status: 200 });

  } catch (error: any) {
    console.error(`Unexpected error in DELETE /api/admin/users/${id}:`, error);
    return NextResponse.json({ message: 'Внутренняя ошибка сервера', error: error.message }, { status: 500 });
  }
}