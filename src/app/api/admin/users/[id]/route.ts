import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/config/auth';
import { supabase } from '@/lib/supabaseClient';

// PUT /api/admin/users/[id] - обновить пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;
    const { id } = params;

    // Проверяем права доступа
    if (!['admin', 'super_admin'].includes(userRole) && currentUserId !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { first_name, last_name, phone, company_name, position, role, is_active } = body;

    // Получаем текущие данные пользователя
    const { data: currentUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Проверяем права на изменение роли
    if (role && role !== currentUser.role) {
      if (userRole !== 'super_admin') {
        return NextResponse.json({ error: 'Insufficient permissions to change role' }, { status: 403 });
      }
      
      // Нельзя изменить роль super_admin
      if (currentUser.role === 'super_admin' && userRole !== 'super_admin') {
        return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 403 });
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (phone !== undefined) updateData.phone = phone;
    if (company_name !== undefined) updateData.company_name = company_name;
    if (position !== undefined) updateData.position = position;
    
    // Только админы могут менять роль и статус
    if (['admin', 'super_admin'].includes(userRole)) {
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;
    }

    // Обновляем пользователя
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ user: data });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - удалить пользователя
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;
    const { id } = params;

    // Только super_admin может удалять пользователей
    if (userRole !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Нельзя удалить самого себя
    if (currentUserId === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Получаем данные пользователя
    const { data: userData, error: fetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', id)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Нельзя удалить другого super_admin
    if (userData.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 });
    }

    // Удаляем пользователя из auth.users (профиль удалится автоматически через CASCADE)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}