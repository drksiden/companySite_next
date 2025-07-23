// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { UserProfile, UserCreatePayload } from '@/lib/services/user'; // Убедитесь, что эти типы определены или импортированы
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


// GET /api/admin/users - List all users
export async function GET(req: NextRequest) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return NextResponse.json({ message: 'Error fetching user profiles', error: profilesError.message }, { status: 500 });
    }

    return NextResponse.json(profiles as UserProfile[], { status: 200 });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/users:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  const authResult = await authorizeAdmin(req);
  if (!authResult.authorized) {
    return authResult.response;
  }

  const { email, password, ...profileData }: UserCreatePayload = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email и пароль обязательны' }, { status: 400 });
  }

  try {
    // 1. Create user in Supabase Auth using admin API
    // Также можно добавить role в user_metadata, чтобы она была доступна сразу в app_metadata
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        // Добавляем роль в user_metadata, чтобы она попала в app_metadata
        role: profileData.role || 'customer', 
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return NextResponse.json({ message: 'Пользователь с таким email уже зарегистрирован.' }, { status: 409 });
      }
      console.error('Error creating auth user:', authError);
      return NextResponse.json({ message: `Ошибка создания пользователя: ${authError.message}` }, { status: 500 });
    }

    if (!authData.user) {
      return NextResponse.json({ message: 'Не удалось получить данные нового пользователя после регистрации.' }, { status: 500 });
    }

    // 2. Create profile in public.profiles table
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email, // Store email in profile for easier search, though it's in auth.users too
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        role: profileData.role || 'customer', // Default to 'customer' if not provided
        is_active: profileData.is_active ?? true,
        company_id: profileData.company_id,
        position: profileData.position,
        avatar_url: profileData.avatar_url,
        timezone: profileData.timezone || 'Asia/Almaty',
        locale: profileData.locale || 'ru-RU',
        permissions: profileData.permissions || [],
        address: profileData.address || {},
      } as Omit<UserProfile, 'created_at' | 'updated_at'>) // Cast to ensure type compatibility
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Attempt to delete auth user if profile creation fails for cleanup
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ message: 'Ошибка создания профиля пользователя', error: profileError.message }, { status: 500 });
    }

    return NextResponse.json(newProfile, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/users:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}