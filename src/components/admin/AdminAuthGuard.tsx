'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AdminAuthGuardProps {
  children: ReactNode;
  requiredRole?: ('manager' | 'admin' | 'super_admin')[];
  fallback?: ReactNode;
}

export function AdminAuthGuard({ 
  children, 
  requiredRole = ['manager', 'admin', 'super_admin'],
  fallback 
}: AdminAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const userRole = session.user?.role;
    if (!userRole || !requiredRole.includes(userRole)) {
      // Если у пользователя нет нужной роли, но он авторизован
      if (userRole === 'customer') {
        router.push('/');
      } else {
        router.push('/admin'); // Перенаправляем на главную админки
      }
      return;
    }
  }, [session, status, router, requiredRole]);

  // Показываем загрузку
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Проверка доступа...</p>
        </div>
      </div>
    );
  }

  // Пользователь не авторизован
  if (!session) {
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

  // Проверяем роль пользователя
  const userRole = session.user?.role;
  if (!userRole || !requiredRole.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <p>У вас недостаточно прав для доступа к этой странице.</p>
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

  // Пользователь авторизован и имеет нужную роль
  return <>{children}</>;
}

// Хук для проверки прав доступа
export function useAdminAuth(requiredRole?: ('manager' | 'admin' | 'super_admin')[]) {
  const { data: session, status } = useSession();
  
  const hasAccess = () => {
    if (status === 'loading') return null;
    if (!session) return false;
    
    const userRole = session.user?.role;
    if (!userRole) return false;
    
    if (!requiredRole) {
      return ['manager', 'admin', 'super_admin'].includes(userRole);
    }
    
    return requiredRole.includes(userRole);
  };

  const canAccess = (roles: string[]) => {
    const userRole = session?.user?.role;
    return userRole && roles.includes(userRole);
  };

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    hasAccess: hasAccess(),
    canAccess,
    userRole: session?.user?.role,
    permissions: session?.user?.permissions || [],
  };
}