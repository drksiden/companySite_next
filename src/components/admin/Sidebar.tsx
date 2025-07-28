"use client";

import { useState, memo, useMemo, forwardRef, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ChevronLeft,
  Search,
  ChevronDown,
  Sparkles,
  Folder,
  ShoppingBag,
  Tag,
  Palette,
  Database,
  Users,
  BarChart3,
  FileText,
  Globe,
  Settings,
  Bell,
  Shield,
  X,
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
      { title: "SEO", href: "/admin/settings/seo", icon: Globe },
      {
        title: "База данных",
        href: "/admin/settings/database",
        icon: Database,
      },
      { title: "Безопасность", href: "/admin/settings/security", icon: Shield },
    ],
  },
];

// Анимационные варианты для sidebar
const sidebarVariants = {
  expanded: {
    width: 280,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
    },
  },
  collapsed: {
    width: 80,
    transition: {
      duration: 0.4,
      staggerChildren: 0.05,
    },
  },
};

// Варианты анимации для элементов навигации
const navItemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Варианты для анимации подменю
const submenuVariants = {
  closed: {
    height: 0,
    opacity: 0,
  },
  open: {
    height: "auto",
    opacity: 1,
  },
};

const submenuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

// Компонент для создания эффекта ripple
const RippleEffect = memo(({ x, y }: { x: number; y: number }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 4, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <div className="w-4 h-4 bg-primary/30 rounded-full" />
  </motion.div>
));

RippleEffect.displayName = "RippleEffect";

// Компонент подменю
const SubMenu = memo(
  ({
    children,
    isOpen,
    sidebarCollapsed,
  }: {
    children: any[];
    isOpen: boolean;
    sidebarCollapsed: boolean;
  }) => (
    <AnimatePresence>
      {isOpen && !sidebarCollapsed && (
        <motion.div
          variants={submenuVariants}
          initial="closed"
          animate="open"
          exit="closed"
          className="overflow-hidden"
        >
          <motion.div className="space-y-1 pt-2 pb-1 pl-4">
            {children.map((child, index) => (
              <motion.div
                key={child.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <NavigationLink
                  item={child}
                  sidebarCollapsed={false}
                  isSubmenu
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ),
);

SubMenu.displayName = "SubMenu";

// Основной компонент ссылки навигации
const NavigationLink = memo(
  ({
    item,
    sidebarCollapsed,
    isSubmenu = false,
  }: {
    item: any;
    sidebarCollapsed: boolean;
    isSubmenu?: boolean;
  }) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [ripples, setRipples] = useState<
      { id: number; x: number; y: number }[]
    >([]);
    const rippleId = useRef(0);

    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isChildActive =
      hasChildren &&
      item.children.some((child: any) => pathname === child.href);

    useEffect(() => {
      if (isChildActive) {
        setIsOpen(true);
      }
    }, [isChildActive]);

    const handleClick = (e: React.MouseEvent) => {
      if (hasChildren && !sidebarCollapsed) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }

      // Создаем эффект ripple
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: rippleId.current++, x, y };

      setRipples((prev) => [...prev, newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    };

    const content = (
      <motion.div
        whileHover={{ scale: 1.02, x: 2 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <Button
          variant="ghost"
          className={cn(
            "w-full relative overflow-hidden group transition-all duration-300",
            "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10",
            "hover:shadow-md hover:shadow-primary/5",
            isActive || isChildActive
              ? "bg-gradient-to-r from-primary/15 to-accent/15 text-primary shadow-lg shadow-primary/10 border border-primary/20"
              : "hover:bg-accent/50",
            sidebarCollapsed ? "justify-center px-2" : "justify-start px-4",
            isSubmenu && "ml-4 text-sm",
          )}
          onClick={handleClick}
          asChild={!hasChildren || sidebarCollapsed}
        >
          {!hasChildren || sidebarCollapsed ? (
            <Link href={item.href} className="flex items-center gap-3 py-3">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon with subtle animation */}
              <motion.div
                animate={{
                  rotate: isActive ? [0, 5, -5, 0] : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive || isChildActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
              </motion.div>

              {/* Text with slide animation */}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "relative z-10 font-medium transition-colors duration-200",
                      isActive || isChildActive
                        ? "text-primary"
                        : "group-hover:text-primary",
                    )}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge for active items */}
              {(isActive || isChildActive) && !sidebarCollapsed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-auto relative z-10"
                >
                  <Badge variant="default" className="h-2 w-2 p-0 bg-primary" />
                </motion.div>
              )}

              {/* Expand icon for items with children */}
              {hasChildren && !sidebarCollapsed && (
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-auto relative z-10"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </motion.div>
              )}

              {/* Ripple effects */}
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}
              </AnimatePresence>
            </Link>
          ) : (
            <div className="flex items-center gap-3 py-3 w-full">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon with subtle animation */}
              <motion.div
                animate={{
                  rotate: isActive ? [0, 5, -5, 0] : 0,
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive || isChildActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                />
              </motion.div>

              {/* Text with slide animation */}
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "relative z-10 font-medium transition-colors duration-200",
                      isActive || isChildActive
                        ? "text-primary"
                        : "group-hover:text-primary",
                    )}
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge for active items */}
              {(isActive || isChildActive) && !sidebarCollapsed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="ml-auto relative z-10"
                >
                  <Badge variant="default" className="h-2 w-2 p-0 bg-primary" />
                </motion.div>
              )}

              {/* Expand icon for items with children */}
              {hasChildren && !sidebarCollapsed && (
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="ml-auto relative z-10"
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
                </motion.div>
              )}

              {/* Ripple effects */}
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </Button>
      </motion.div>
    );

    if (sidebarCollapsed && hasChildren) {
      return (
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-1">
              <span className="font-medium">{item.title}</span>
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {child.title}
                </Link>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <>
        {content}
        {hasChildren && (
          <SubMenu
            children={item.children}
            isOpen={isOpen}
            sidebarCollapsed={sidebarCollapsed}
          />
        )}
      </>
    );
  },
);

NavigationLink.displayName = "NavigationLink";

interface SidebarProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarOpen,
  setSidebarCollapsed,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  // Оптимизированная фильтрация навигации
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
    <motion.aside
      variants={sidebarVariants}
      animate={sidebarCollapsed ? "collapsed" : "expanded"}
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-card via-card to-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-background/80 before:to-background/40 before:backdrop-blur-xl before:-z-10",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
      style={{
        background:
          "linear-gradient(145deg, hsl(var(--card)), hsl(var(--card)/0.95))",
      }}
    >
      <div className="flex h-full flex-col relative">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

        {/* Header */}
        <motion.div
          className="sticky top-0 z-10 bg-card/80 backdrop-blur-xl flex h-16 items-center justify-between px-6 border-b border-border/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/admin" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg blur-sm" />
              <Package className="relative h-8 w-8 text-primary transition-all duration-300 group-hover:text-primary/80" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-2 h-2 text-white" />
              </motion.div>
            </motion.div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Admin
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Dashboard
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex hover:bg-accent/50 transition-all duration-200"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label={
                sidebarCollapsed ? "Развернуть панель" : "Свернуть панель"
              }
            >
              <motion.div
                animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronLeft className="h-5 w-5" />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-accent/50 transition-all duration-200"
              onClick={() => setSidebarOpen(false)}
              aria-label="Закрыть панель"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          className="px-4 py-4 border-b border-border/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {sidebarCollapsed ? (
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full justify-center hover:bg-primary/10 hover:text-primary transition-all duration-200"
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
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{
                  scale: searchFocused ? 1.02 : 1,
                  boxShadow: searchFocused
                    ? "0 0 0 2px hsl(var(--primary)/20)"
                    : "0 0 0 1px hsl(var(--border))",
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="pl-9 h-10 bg-background/50 border-border/50 focus:bg-background transition-all duration-200"
                  placeholder="Поиск..."
                  aria-label="Поиск по навигации"
                />
              </motion.div>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-4">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-2"
          >
            <LayoutGroup>
              {filteredNavigation.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <NavigationLink
                    item={item}
                    sidebarCollapsed={sidebarCollapsed}
                  />
                </motion.div>
              ))}
            </LayoutGroup>
          </motion.nav>
        </ScrollArea>

        {/* User Menu */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <UserMenu sidebarCollapsed={sidebarCollapsed} />
        </motion.div>
      </div>
    </motion.aside>
  );
}
