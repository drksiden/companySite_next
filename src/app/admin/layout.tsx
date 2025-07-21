'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useTransition, useCallback, useRef, memo, useMemo } from 'react';
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
import { motion, AnimatePresence, LayoutGroup, Easing } from 'framer-motion'; // Import Easing
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
  X,
  ChevronLeft,
  Search,
  Moon,
  Sun,
  Loader2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Интерфейс элемента навигации
interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  requiredRole?: string[];
  children?: NavigationItem[];
}

// Список навигации
const navigation: NavigationItem[] = [
  { title: 'Главная', href: '/admin', icon: LayoutDashboard },
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
  { title: 'Заказы', href: '/admin/orders', icon: ShoppingBag, badge: '3' },
  { title: 'Пользователи', href: '/admin/users', icon: Users, requiredRole: ['admin', 'super_admin'] },
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

// Варианты анимаций
const sidebarVariants = {
  expanded: { width: 256 },
  collapsed: { width: 80 },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
      ease: 'easeOut' as Easing, // Cast to Easing
      when: 'beforeChildren',
    }
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } }
};

const dropdownVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.2, ease: 'easeOut' as Easing } // Cast to Easing
  }
};

const pageTransitionVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as Easing } }, // Cast to Easing
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' as Easing } } // Cast to Easing
};

const NavigationLink = memo(({ 
  item, 
  level = 0,
  index = 0 
}: { 
  item: NavigationItem;
  level?: number;
  index?: number;
  sidebarCollapsed: boolean; // Add sidebarCollapsed prop
}) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const isActive = pathname === item.href || 
    (item.children && item.children.some(child => pathname.startsWith(child.href)));
  const Icon = item.icon;
  const isExpanded = expandedItems.has(item.href);
  const shouldAnimate = useRef(true);
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Define sidebarCollapsed here

  useEffect(() => {
    shouldAnimate.current = false;
  }, []);

  const toggleExpanded = useCallback((href: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  }, []);

  // Pass sidebarCollapsed to NavigationLink
  useEffect(() => {
    setExpandedItems(new Set()); // Collapse all dropdowns when sidebar collapses
  }, [sidebarCollapsed]);

  const handleNavigation = useCallback((href: string) => {
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  const hasPermission = (item: NavigationItem) => {
    if (!item.requiredRole) return true;
    const userRole = session?.user?.role;
    return userRole && item.requiredRole.includes(userRole);
  };

  if (!hasPermission(item)) return null;

  if (item.children) {
    return (
      <motion.div
        custom={index}
        variants={menuItemVariants}
        initial={shouldAnimate.current ? "hidden" : false}
        animate="visible"
        exit="exit"
        layout
      >
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleExpanded(item.href)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  level > 0 && "ml-4",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  sidebarCollapsed && isActive && "bg-primary/10 border-l-4 border-primary"
                )}
                aria-expanded={isExpanded}
                aria-label={item.title}
              >
                <div className="flex items-center">
                  <Icon className={cn(
                    "shrink-0 transition-all duration-200",
                    sidebarCollapsed ? "h-5 w-5" : "mr-3 h-4 w-4"
                  )} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {!sidebarCollapsed && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                )}
              </button>
            </TooltipTrigger>
            {sidebarCollapsed && (
              <TooltipContent side="right" className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <p>{item.title}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        <AnimatePresence>
          {isExpanded && !sidebarCollapsed && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="ml-6 mt-1 space-y-1 overflow-hidden"
            >
              {item.children.map((child, childIndex) => (
                <NavigationLink
                  key={child.href}
                  item={child}
                  level={level + 1}
                  index={childIndex}
                  sidebarCollapsed={sidebarCollapsed} // Pass sidebarCollapsed prop
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      custom={index}
      variants={menuItemVariants}
      initial={shouldAnimate.current ? "hidden" : false}
      animate="visible"
      exit="exit"
      layout
    >
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleNavigation(item.href)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                level > 0 && "ml-4",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                sidebarCollapsed && isActive && "bg-primary/10 border-l-4 border-primary"
              )}
              aria-label={item.title}
            >
              <div className="flex items-center">
                <Icon className={cn(
                  "shrink-0 transition-all duration-200",
                  sidebarCollapsed ? "h-5 w-5" : "mr-3 h-4 w-4",
                  !isActive && "group-hover:scale-110"
                )} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {item.badge && !sidebarCollapsed && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          </TooltipTrigger>
          {sidebarCollapsed && (
            <TooltipContent side="right" className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <p>{item.title}</p>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
});

// Добавляем displayName для лучшей отладки
NavigationLink.displayName = 'NavigationLink';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Define sidebarCollapsed here
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Оптимизированная фильтрация навигации
  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return navigation;
    return navigation.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.children?.some(child =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery]);

  // Определяем активные элементы на основе текущего пути
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

  const handleNavigation = useCallback((href: string) => {
    setIsNavigating(true);
    startTransition(() => {
      router.push(href);
      setTimeout(() => setIsNavigating(false), 300);
      setSidebarOpen(false);
    });
  }, [router]);

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

  if (status === 'loading') {
    return (
      <div className="flex h-screen bg-background">
        <aside className="w-64 bg-card border-r">
          <div className="p-6">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="px-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside
          variants={sidebarVariants}
          animate={sidebarCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card flex h-16 items-center justify-between px-6 border-b">
              <Link href="/admin" className="flex items-center space-x-2 group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Package className="h-6 w-6 text-primary transition-colors group-hover:text-primary/80" />
                </motion.div>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-lg font-semibold"
                    >
                      Admin
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  aria-label={sidebarCollapsed ? "Развернуть панель" : "Свернуть панель"}
                >
                  <motion.div
                    animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </motion.div>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Закрыть панель"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b">
              <div className="relative">
                {sidebarCollapsed ? (
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSearchQuery('')}
                          className="w-full justify-center"
                          aria-label="Открыть поиск"
                        >
                          <Search className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">Поиск</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9"
                      aria-label="Поиск по навигации"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-4">
              <motion.nav
                variants={{
                  hidden: { transition: { staggerChildren: 0.05 } },
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
                initial="hidden"
                animate="visible"
              >
                <LayoutGroup>
                  {filteredNavigation.map((item, index) => (
                    <NavigationLink key={item.href} item={item} index={index} sidebarCollapsed={sidebarCollapsed} />
                  ))}
                </LayoutGroup>
              </motion.nav>
            </ScrollArea>

            {/* User Menu & Theme Toggle */}
            <div className="border-t p-4 space-y-3">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 h-auto" aria-label="Меню пользователя">
                    <Avatar className={cn("h-8 w-8", !sidebarCollapsed && "mr-3")}>
                      <AvatarImage src={session.user?.avatar_url || ''} />
                      <AvatarFallback>
                        {getInitials(session.user?.name, session.user?.email)}
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
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 bg-background flex h-16 items-center justify-between border-b px-6 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть панель навигации"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        {/* Page Content with loading state */}
        <main className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {(isPending || isNavigating) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            key={pathname}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </div>
  );
}