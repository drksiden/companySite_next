'use client';

import { useState, memo, useMemo, forwardRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  Folder,
  Tag,
  Palette,
  Database,
  FileText,
  Globe,
  Shield,
  Bell,
  X,
  ChevronLeft,
  Search,
} from 'lucide-react';
import { UserMenu } from './UserMenu';

const navigation = [
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

// Framer Motion variants for sidebar
const sidebarVariants = {
  expanded: { width: 256, transition: { duration: 0.3, ease: 'easeInOut' } },
  collapsed: { width: 80, transition: { duration: 0.3, ease: 'easeInOut' } },
};

// Enhanced NavigationLink component with Tooltip for collapsed state
const NavigationLink = memo(({ item, sidebarCollapsed }: { item: any; sidebarCollapsed: boolean; }) => {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.children && item.children.some((child: any) => pathname.startsWith(child.href)));

  const linkContent = (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent',
        sidebarCollapsed ? 'justify-center' : 'justify-start'
      )}
    >
      {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate flex-1"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
      {!sidebarCollapsed && item.badge && (
        <Badge variant={isActive ? "primary" : "secondary"} className="ml-auto text-xs">
          {item.badge}
        </Badge>
      )}
    </div>
  );

  if (sidebarCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href} className="block">
              {linkContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={item.href}>
      {linkContent}
    </Link>
  );
});

NavigationLink.displayName = 'NavigationLink';

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ sidebarOpen, sidebarCollapsed, setSidebarOpen, setSidebarCollapsed }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
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
                {filteredNavigation.map((item) => (
                  <NavigationLink key={item.href} item={item} sidebarCollapsed={sidebarCollapsed} />
                ))}
              </LayoutGroup>
            </motion.nav>
          </ScrollArea>

          {/* User Menu */}
          <UserMenu sidebarCollapsed={sidebarCollapsed} />
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}