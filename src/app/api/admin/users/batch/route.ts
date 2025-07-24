import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

async function checkAdminPermissions(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: 'Forbidden: Admin access required', status: 403 };
  }

  return { user };
}

export async function DELETE(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const permissionCheck = await checkAdminPermissions(supabase);
  if (permissionCheck.error) {
    return NextResponse.json({ message: permissionCheck.error }, { status: permissionCheck.status });
  }

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'IDs are required' }, { status: 400 });
    }

    // Сначала удаляем из user_profiles, чтобы избежать проблем с внешними ключами, если они есть
    const { error: deleteProfilesError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .in('id', ids);

    if (deleteProfilesError) {
      // Можно логировать ошибку, но продолжить попытку удалить из auth
      console.error('Error deleting user profiles:', deleteProfilesError);
    }

    // Затем удаляем пользователей из Auth
    // Promise.all для параллельного выполнения запросов
    const deleteAuthUsersPromises = ids.map(id => supabaseAdmin.auth.admin.deleteUser(id));
    const results = await Promise.allSettled(deleteAuthUsersPromises);

    const failedDeletions = results.filter(result => result.status === 'rejected');

    if (failedDeletions.length > 0) {
      console.error('Failed to delete some users from Auth:', failedDeletions);
      // Даже если часть не удалилась, профили уже удалены.
      // Возвращаем ошибку, чтобы фронтенд знал о проблеме.
      return NextResponse.json({
        message: 'Some users could not be deleted from authentication service.',
        failed_ids: failedDeletions.map((p, i) => ({ id: ids[i], reason: (p as PromiseRejectedResult).reason }))
      }, { status: 500 });
    }

    return NextResponse.json({ message: 'Users deleted successfully' }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
