'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

interface AdminAuthGuardProps {
  children: ReactNode;
  requiredRole?: ('customer' | 'manager' | 'admin' | 'super_admin')[];
  fallback?: ReactNode;
}

export function AdminAuthGuard({ 
  children, 
  requiredRole = ['manager', 'admin', 'super_admin'],
  fallback 
}: AdminAuthGuardProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let ignore = false;
    async function checkAuth() {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      console.log('AdminAuthGuard - User:', data?.user ? `${data.user.id} (${data.user.email})` : 'null');
      console.log('AdminAuthGuard - Auth error:', error);
      
      if (!ignore) {
        setUser(data?.user || null);
        if (data?.user?.id) {
          // Получаем роль из таблицы user_profiles
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          console.log('AdminAuthGuard - Profile:', profile);
          console.log('AdminAuthGuard - Profile error:', profileError);
          setUserRole(profile?.role || null);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    }
    checkAuth();
    // Подписка на изменения сессии
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log('AdminAuthGuard - State changed:', { loading, user: user?.id, userRole, requiredRole });
    if (loading) return;
    if (!user) {
      console.log('AdminAuthGuard - No user, redirecting to signin');
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!userRole || !requiredRole.includes(userRole)) {
      console.log('AdminAuthGuard - Insufficient role, current:', userRole, 'required:', requiredRole);
      if (userRole === 'customer') {
        router.push('/');
      } else {
        router.push('/admin');
      }
    }
  }, [user, userRole, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Необходима авторизация для доступа к этой странице.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userRole || !requiredRole.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>У вас недостаточно прав для доступа к этой странице.</p>
            <div className="text-xs text-gray-500 mt-2">
              User ID: {user?.id}<br/>
              Email: {user?.email}<br/>
              Role: {userRole || 'не найдена'}<br/>
              Required: {requiredRole.join(', ')}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/admin')}
              >
                Вернуться в админку
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/')}
              >
                На главную
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// Хук для проверки прав доступа через Supabase
export function useAdminAuth(requiredRole?: ('customer' |'manager' | 'admin' | 'super_admin')[]) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function checkAuth() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data?.user || null);
        if (data?.user?.id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, permissions')
            .eq('id', data.user.id)
            .single();
          setUserRole(profile?.role || null);
        }
        setLoading(false);
      }
    }
    checkAuth();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const hasAccess = !loading && userRole && (requiredRole ? requiredRole.includes(userRole) : ['manager', 'admin', 'super_admin'].includes(userRole));
  const canAccess = (roles: string[]) => userRole && roles.includes(userRole);

  return {
    user,
    isLoading: loading,
    isAuthenticated: !!user,
    hasAccess,
    canAccess,
    userRole,
    permissions: [],
  };
}