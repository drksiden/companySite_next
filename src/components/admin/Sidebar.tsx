"use client";

import { useState, memo, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Search,
  ChevronDown,
  Folder,
  ShoppingBag,
  Tag,
  Palette,
  Users,
  BarChart3,
  Settings,
  Bell,
  Shield,
  X,
  FileText,
  Newspaper,
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const navigation = [
  { title: "Главная", href: "/admin", icon: LayoutDashboard },
  {
    title: "Каталог",
    href: "/admin/catalog",
    icon: Package,
    children: [
      { title: "Товары", href: "/admin/catalog/products", icon: ShoppingBag },
      { title: "Категории", href: "/admin/catalog/categories", icon: Folder },
      { title: "Бренды", href: "/admin/catalog/brands", icon: Tag },
      { title: "Коллекции", href: "/admin/catalog/collections", icon: Palette },
    ],
  },
  { title: "Заказы", href: "/admin/orders", icon: FileText },
  { title: "Новости", href: "/admin/news", icon: Newspaper },
  { title: "Пользователи", href: "/admin/users", icon: Users },
  { title: "Аналитика", href: "/admin/analytics", icon: BarChart3 },
  {
    title: "Настройки",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { title: "Общие", href: "/admin/settings", icon: Settings },
      {
        title: "Уведомления",
        href: "/admin/settings/notifications",
        icon: Bell,
      },
      { title: "Безопасность", href: "/admin/settings/security", icon: Shield },
    ],
  },
];

// Анимационные варианты для sidebar

// Компонент подменю
const SubMenu = memo(
  ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="space-y-1 py-2 pl-8 pr-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);

SubMenu.displayName = "SubMenu";

// Основной компонент ссылки навигации
const NavigationLink = memo(
  ({ item, isSubmenu = false }: { item: any; isSubmenu?: boolean }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive =
      hasChildren &&
      item.children.some((child: any) => pathname === child.href);

    // Открываем подменю если есть активный дочерний элемент
    useEffect(() => {
      if (isChildActive) {
        setIsOpen(true);
      }
    }, [isChildActive]);

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    const content = (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-10 px-3 font-normal transition-colors",
          isActive || isChildActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
          isSubmenu && "text-sm",
        )}
        onClick={handleClick}
        asChild={!hasChildren}
      >
        {!hasChildren ? (
          <Link href={item.href} className="flex items-center gap-3">
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </div>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            )}
          </div>
        )}
      </Button>
    );

    return (
      <>
        {content}
        {hasChildren && (
          <SubMenu isOpen={isOpen}>
            {item.children.map((child: any) => (
              <NavigationLink key={child.href} item={child} isSubmenu />
            ))}
          </SubMenu>
        )}
      </>
    );
  },
);

NavigationLink.displayName = "NavigationLink";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Фильтрация навигации
  const filteredNavigation = useMemo(() => {
    if (!searchQuery) return navigation;
    return navigation.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.children?.some((child) =>
          child.title.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [searchQuery]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin</span>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-8 h-9"
              placeholder="Поиск..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-2">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <NavigationLink key={item.href} item={item} />
              ))}
            </div>
          </nav>
        </ScrollArea>

        {/* User Menu */}
        <UserMenu />
      </div>
    </aside>
  );
}
