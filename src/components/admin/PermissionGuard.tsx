'use client';

import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth/permissions';
import { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { data: session } = useSession();
  
  if (!session?.user) {
    return <>{fallback}</>;
  }
  
  const userPermissions = session.user.permissions || [];
  const userRole = session.user.role || 'customer';
  
  if (hasPermission(userRole, userPermissions, permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}