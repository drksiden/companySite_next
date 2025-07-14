// src/app/admin/layout.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home,
  Folder,
  Tag,
  Palette,
  Database,
  FileText,
  Globe,
  Shield,
  Bell,
  ChevronDown,
  X
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  requiredRole?: string[];
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  {
    title: 'Главная',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Каталог',
    href: '/admin/catalog',
    icon: Package,
    children: [
      { title: 'Категории', href: '/admin/catalog/categories', icon: Folder },
      { title: 'Товары', href: '/admin/catalog/products', icon: ShoppingBag },
      { title: 'Бренды', href: '/admin/catalog/brands', icon: Tag },
      { title: 'Коллекции', href: '/admin/catalog/collections', icon: Palette },
      { title: 'Атрибуты', href: '/admin/catalog/attributes', icon: Database },
    ]
  },
  {
    title: 'Заказы',
    href: '/admin/orders',
    icon: ShoppingBag,
    badge: '3',
  },
  {
    title: 'Пользователи',
    href: '/admin/users',
    icon: Users,
    requiredRole: ['admin', 'super_admin'],
  },
  {
    title: 'Аналитика',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { title: 'Отчеты', href: '/admin/analytics/reports', icon: FileText },
      { title: 'Продажи', href: '/admin/analytics/sales', icon: BarChart3 },
      { title: 'Трафик', href: '/admin/analytics/traffic', icon: Globe },
    ]
  },
  {
    title: 'Настройки',
    href: '/admin/settings',
    icon: Settings,
    requiredRole: ['super_admin'],
    children: [
      { title: 'Общие', href: '/admin/settings/general', icon: Settings },
      { title: 'Уведомления', href: '/admin/settings/notifications', icon: Bell },
      { title: 'Безопасность', href: '/admin/settings/security', icon: Shield },
    ]
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(pathname));
      return;
    }

    const userRole = session.user?.role;
    if (!userRole || !['manager', 'admin', 'super_admin'].includes(userRole)) {
      router.push('/');
      return;
    }
  }, [session, status, router, pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name[0]?.toUpperCase() || 'U';
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ';
      case 'admin': return 'Админ';
      case 'manager': return 'Менеджер';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  const hasPermission = (item: NavigationItem) => {
    if (!item.requiredRole) return true;
    const userRole = session?.user?.role;
    return userRole && item.requiredRole.includes(userRole);
  };

  const NavigationLink = ({ item, level = 0 }: { item: NavigationItem; level?: number }) => {
    const isActive = pathname === item.href || (item.children && item.children.some(child => pathname === child.href));
    const Icon = item.icon;

    if (!hasPermission(item)) return null;

    if (item.children) {
      return (
        <div>
          <div className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            level > 0 && "ml-4",
            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}>
            <div className="flex items-center">
              <Icon className="mr-3 h-4 w-4" />
              {item.title}
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="ml-6 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavigationLink key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          level > 0 && "ml-4",
          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="flex items-center">
          <Icon className="mr-3 h-4 w-4" />
          {item.title}
        </div>
        {item.badge && (
          <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
            {item.badge}
          </Badge>
        )}
      </Link>
    );
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/admin" className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">Admin</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => (
              <NavigationLink key={item.href} item={item} />
            ))}
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={session.user?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(session.user?.name, session.user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">
                      {session.user?.name || session.user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Badge 
                        variant={getRoleBadgeVariant(session.user?.role || '')} 
                        className="text-xs"
                      >
                        {getRoleLabel(session.user?.role || '')}
                      </Badge>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Профиль</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings">Настройки</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center">
                    <Home className="mr-2 h-4 w-4" />
                    На сайт
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}