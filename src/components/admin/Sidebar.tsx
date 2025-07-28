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
} from "lucide-react";
import { UserMenu } from "./UserMenu";

const navigation = [
  { title: "Главная", href: "/admin", icon: LayoutDashboard },
  { title: "Каталог",
  href: "/admin/catalog",
  icon: Package,
  children: [
    { title: "Категории", href: "/admin/catalog/categories", icon: Folder },
    { title: "Товары", href: "/admin/catalog/products", icon: ShoppingBag },
    { title: "Бренды", href: "/admin/catalog/brands", icon: Tag },
    { title: "Коллекции", href: "/admin/catalog/collections", icon: Palette },
    { title: "Атрибуты", href: "/admin/catalog/attributes", icon: Database },
  ],
},
{ title: "Заказы", href: "/admin/orders", icon: ShoppingBag, badge: "3" },
{
  title: "Пользователи",
  href: "/admin/users",
  icon: Users,
  requiredRole: ["admin", "super_admin"],
},
{
  title: "Аналитика",
  href: "/admin/analytics",
  icon: BarChart3,
  children: [
    { title: "Отчеты", href: "/admin/analytics/reports", icon: FileText },
    { title: "Продажи", href: "/admin/analytics/sales", icon: BarChart3 },
    { title: "Трафик", href: "/admin/analytics/traffic", icon: Globe },
  ],
},
{
  title: "Настройки",
  href: "/admin/settings",
  icon: Settings,
  requiredRole: ["super_admin"],
  children: [
    { title: "Общие", href: "/admin/settings/general", icon: Settings },
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
    x: -20,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  hover: {
    x: 4,
    transition: { duration: 0.2 },
  },
};

// Варианты для подменю
const submenuVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const submenuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
};

// Компонент для ripple эффекта
const RippleEffect = ({ isActive }: { isActive: boolean }) => (
  <motion.div
    className="absolute inset-0 rounded-lg overflow-hidden"
    initial={false}
    animate={isActive ? "active" : "inactive"}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10"
      variants={{
        inactive: { opacity: 0, scale: 0.8 },
        active: { opacity: 1, scale: 1 },
      }}
      transition={{ duration: 0.3 }}
    />
    <motion.div
      className="absolute inset-0 bg-primary/5 backdrop-blur-sm"
      variants={{
        inactive: { opacity: 0 },
        active: { opacity: 1 },
      }}
      transition={{ duration: 0.2 }}
    />
  </motion.div>
);

// Улучшенный компонент подменю
const SubMenu = memo(
  ({
    children,
    isOpen,
    sidebarCollapsed,
  }: {
    children: any[];
    isOpen: boolean;
    sidebarCollapsed: boolean;
  }) => {
    const pathname = usePathname();

    return (
      <AnimatePresence>
      {isOpen && !sidebarCollapsed && (
        <motion.div
          variants={submenuVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="overflow-hidden"
        >
          <motion.div
            className="pl-8 pr-2 pb-1 space-y-1"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {children.map((child) => {
              const isChildActive = pathname === child.href;
              return (
                <motion.div key={child.href} variants={submenuItemVariants}>
                  <Link
                    href={child.href}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isChildActive
                        ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                    )}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {child.icon && (
                        <child.icon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </motion.div>
                    <span className="truncate">{child.title}</span>
                    {isChildActive && (
                      <motion.div
                        layoutId="activeSubmenuIndicator"
                        className="absolute left-0 top-1/2 w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-r-full"
                        style={{ translateY: "-50%" }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    );
  },
);

SubMenu.displayName = "SubMenu";

// Улучшенный NavigationLink компонент
const NavigationLink = memo(
  ({ item, sidebarCollapsed }: { item: any; sidebarCollapsed: boolean }) => {
    const pathname = usePathname();
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 });
    const isActive =
      pathname === item.href ||
      (item.children &&
        item.children.some((child: any) => pathname.startsWith(child.href)));
    const hasActiveChild =
      item.children &&
      item.children.some((child: any) => pathname === child.href);

    // Открываем подменю если есть активный дочерний элемент
    useEffect(() => {
      if (hasActiveChild) {
        setIsSubmenuOpen(true);
      }
    }, [hasActiveChild]);

    const handleClick = (e: React.MouseEvent) => {
      if (item.children && !sidebarCollapsed) {
        e.preventDefault();
        setIsSubmenuOpen(!isSubmenuOpen);
      }

      // Запоминаем позицию клика для ripple эффекта
      const rect = e.currentTarget.getBoundingClientRect();
      setRippleOrigin({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const linkContent = (
      <motion.div
        className={cn(
          "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden",
          isActive || hasActiveChild
            ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-primary shadow-lg shadow-primary/10 border border-primary/20"
            : "text-muted-foreground hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/20 hover:text-accent-foreground hover:shadow-md",
          sidebarCollapsed ? "justify-center px-3" : "justify-start",
        )}
        variants={navItemVariants}
        whileHover="hover"
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
      >
        {/* Ripple effect background */}
        <RippleEffect isActive={isActive || hasActiveChild} />

        {/* Active indicator */}
        {(isActive || hasActiveChild) && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/60 rounded-r-full shadow-lg shadow-primary/30"
            style={{ translateY: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}

        {/* Icon */}
        <motion.div
          className="relative z-10"
          whileHover={{
            scale: 1.1,
            rotate: item.children ? (isSubmenuOpen ? 0 : 5) : 5,
          }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {item.icon && <item.icon className="h-5 w-5 flex-shrink-0" />}
        </motion.div>

        {/* Title and badge */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex items-center justify-between relative z-10"
            >
              <span className="truncate font-medium">{item.title}</span>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className="text-xs font-semibold shadow-sm"
                    >
                      {item.badge}
                    </Badge>
                  </motion.div>
                )}
                {item.children && (
                  <motion.div
                    animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="text-muted-foreground group-hover:text-accent-foreground"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
    if (sidebarCollapsed) {
      return (
        <div className="space-y-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={item.href} className="block">
                  {linkContent}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <p>{item.title}</p>
                {item.badge && (
                  <Badge variant="outline" className="ml-2">
                    {item.badge}
                  </Badge>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {item.children ? (
          <div>
            {linkContent}
            <SubMenu
              children={item.children}
              isOpen={isSubmenuOpen}
              sidebarCollapsed={sidebarCollapsed}
            />
          </div>
        ) : (
          <Link href={item.href}>{linkContent}</Link>
        )}
      </div>
    );
  },
);

NavigationLink.displayName = "NavigationLink";

interface SidebarProps {
  sidebarOpen: boolean;
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
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.2,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <LayoutGroup>
              {filteredNavigation.map((item, index) => (
                <motion.div key={item.href} variants={navItemVariants}>
                  <NavigationLink
                    item={item}
                    sidebarCollapsed={sidebarCollapsed}
                  />
                </motion.div>
              ))}
            </LayoutGroup>
          </motion.nav>

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
  </AnimatePresence>
);
}
