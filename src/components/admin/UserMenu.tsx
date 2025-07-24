'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
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
  LogOut,
  Home,
  Moon,
  Sun,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface UserMenuProps {
  sidebarCollapsed: boolean;
}

export function UserMenu({ sidebarCollapsed }: UserMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user?.id) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getInitials = (firstName?: string | null, lastName?: string | null, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0]?.toUpperCase() || 'U';
    }
    return email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Супер Админ';
      case 'admin': return 'Админ';
      case 'manager': return 'Менеджер';
      case 'customer': return 'Клиент';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'customer': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="border-t p-4 space-y-3">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const userName = userProfile?.first_name || userProfile?.last_name 
    ? `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim()
    : null;
  const userEmail = user?.email;
  const userRole = userProfile?.role;
  const avatarUrl = userProfile?.avatar_url;

  return (
    <div className="border-t p-4 space-y-3">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className={cn(
          "w-full justify-start",
          sidebarCollapsed && "justify-center"
        )}
        aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      >
        <motion.div
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? (
            <Sun className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
          ) : (
            <Moon className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
          )}
        </motion.div>
        {!sidebarCollapsed && (
          <span>{theme === 'dark' ? 'Светлая тема' : 'Темная тема'}</span>
        )}
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-2 h-auto" aria-label="Меню пользователя">
            <Avatar className={cn("h-8 w-8", !sidebarCollapsed && "mr-3")}> 
              <AvatarImage src={avatarUrl || ''} />
              <AvatarFallback>
                {getInitials(userProfile?.first_name, userProfile?.last_name, userEmail)}
              </AvatarFallback>
            </Avatar>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 text-left overflow-hidden"
                >
                  <div className="text-sm font-medium truncate">
                    {userName || userEmail}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Badge
                      variant={getRoleBadgeVariant(userRole || '')}
                      className="text-xs"
                    >
                      {getRoleLabel(userRole || '')}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={sidebarCollapsed ? "center" : "end"}
          className="w-56"
        >
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
  );
}