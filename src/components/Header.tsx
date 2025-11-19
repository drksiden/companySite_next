"use client";

// Анимации удалены для избежания проблем с гидратацией
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose, // Убедитесь, что SheetClose импортирован, если используется
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Menu,
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Heart,
  Sun,
  Moon,
  Search,
  Package,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import { COMPANY_NAME_SHORT } from "@/data/constants";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/lib/supabaseClient";
import { SearchCombobox } from "./search/SearchCombobox";
import { WishlistDropdown } from "./wishlist/WishlistDropdown";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/services", label: "Услуги" },
  { href: "/about", label: "О нас" },
  { href: "/news", label: "Новости" },
  { href: "/contacts", label: "Контакты" },
];

// Константы анимаций удалены, так как анимации больше не используются

const formatPrice = (amount?: number, currencyCode: string = "KZT"): string => {
  if (typeof amount !== "number" || amount === null) {
    return "N/A";
  }

  const currency = currencyCode.toUpperCase();
  if (currency === "KZT") {
    return `${(amount / 100).toLocaleString("kk-KZ")} ₸`;
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
};

interface NavItemProps {
  item: {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
  };
  mobile?: boolean;
  onClose?: () => void;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const router = useRouter();

  // Отслеживаем изменения избранного
  useEffect(() => {
    const updateWishlistCount = () => {
      if (typeof window !== 'undefined') {
        const wishlist = JSON.parse(localStorage.getItem('catalog-wishlist') || '[]');
        setWishlistCount(wishlist.length);
      }
    };

    updateWishlistCount();
    
    // Слушаем кастомное событие обновления избранного
    const handleWishlistUpdate = () => {
      updateWishlistCount();
    };
    
    // Слушаем изменения localStorage (для других вкладок)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'catalog-wishlist') {
        updateWishlistCount();
      }
    };
    
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Supabase auth state
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchUser() {
      setLoadingUser(true);
      const { data } = await supabase.auth.getUser();
      if (!ignore) {
        setUser(data?.user || null);
        setLoadingUser(false);
      }
    }
    fetchUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isAuthenticated = !!user;
  const userFullName =
    user?.user_metadata?.name || user?.user_metadata?.full_name;
  const userEmail = user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url;

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      const parts = name.split(" ");
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.length > 0 ? name[0].toUpperCase() : "U";
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
      if (openMobileMenu) setOpenMobileMenu(false);
    }
  }, [searchQuery, router, openMobileMenu]);

  const NavItem = memo(({ item, mobile = false, onClose }: NavItemProps) => {
    const isActive =
      pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const [isHovered, setIsHovered] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (item.children && !mobile) {
      return (
        <div
          className="relative"
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className={cn(
              "flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive ? "text-primary" : "text-foreground hover:text-primary",
            )}
            aria-expanded={isDropdownOpen}
          >
            {item.label}
            <ChevronDown
              className={cn(
                "ml-1 h-4 w-4 transition-transform duration-200",
                isDropdownOpen ? "rotate-180" : "",
              )}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 py-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors duration-200"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    if (onClose) onClose();
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (mobile) {
      return item.children ? (
        <div className="mb-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "justify-between text-base w-full mb-1 px-3 py-2 h-auto",
                  isActive
                    ? "text-primary bg-accent"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {item.label}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card w-[calc(100%-2rem)] ml-3">
              {item.children.map((child) => (
                <DropdownMenuItem key={child.href} asChild onClick={onClose}>
                  <Link href={child.href} className="w-full">
                    {child.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={cn(
            "justify-start text-base w-full mb-1 px-3 py-2 h-auto",
            isActive
              ? "text-primary bg-accent"
              : "text-foreground hover:bg-accent",
          )}
          onClick={onClose}
        >
          <Link href={item.href}>{item.label}</Link>
        </Button>
      );
    }

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={item.href}
          className={cn(
            "px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            isActive ? "text-primary" : "text-foreground hover:text-primary",
          )}
        >
          {item.label}
        </Link>
        {(isActive || isHovered) && (
          <div className="bg-primary rounded-full origin-left" />
        )}
      </div>
    );
  });

  NavItem.displayName = "NavItem";

  // Header рендерится всегда, но с suppressHydrationWarning для избежания ошибок гидратации
  // Это предотвращает визуальный "прыжок" при появлении Header после монтирования

  return (
    <header
      id="main-navigation"
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm"
      suppressHydrationWarning
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/images/logos/asia-ntb/Asia-NTB-logo-eng-light.svg"
              alt={COMPANY_NAME_SHORT}
              width={140}
              height={40}
              className="block dark:hidden h-10 w-auto"
              style={{ width: "auto", height: "40px" }}
              priority
            />
            <Image
              src="/images/logos/asia-ntb/Asia-NTB-logo-eng-dark.svg"
              alt={COMPANY_NAME_SHORT}
              width={140}
              height={40}
              className="hidden dark:block h-10 w-auto"
              style={{ width: "auto", height: "40px" }}
              priority
            />
          </Link>

          <nav className="hidden lg:flex space-x-1 ml-auto">
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Поиск - только на десктопе */}
            <div className="hidden lg:flex flex-1 max-w-[300px]">
              <SearchCombobox />
            </div>
            
            {/* Иконка поиска для мобильных */}
            <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                  aria-label="Открыть меню"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="lg:hidden w-full max-w-[320px] sm:max-w-[400px] p-0 border-l border-border bg-card"
              >
                <SheetHeader className="p-4 border-b border-border bg-muted/30">
                  <div className="flex justify-between items-center">
                    <SheetTitle className="text-left text-lg font-semibold text-foreground">
                      Меню
                    </SheetTitle>
                  </div>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)]">
                  <div className="py-4 px-3">
                    {/* Поиск в мобильном меню */}
                    <div className="mb-4 relative z-10">
                      <SearchCombobox />
                    </div>
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <NavItem
                          key={item.href}
                          item={item}
                          mobile
                          onClose={() => setOpenMobileMenu(false)}
                        />
                      ))}
                    </nav>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            
            {/* Wishlist Dropdown */}
            <WishlistDropdown wishlistCount={wishlistCount} />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
              aria-label="Сменить тему"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User menu */}
            {loadingUser ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar>
                      {avatarUrl ? (
                        <AvatarImage
                          src={avatarUrl}
                          alt={userFullName || userEmail || "User"}
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(userFullName, userEmail)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="font-semibold">
                      {userFullName || userEmail}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {userEmail}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    {/* <Link href="/account">
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* <Link href="/account/orders">
                      <Package className="mr-2 h-4 w-4" />
                      Мои заказы
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    {/* <Link href="/account/wishlist">
                      <Heart className="mr-2 h-4 w-4" />
                      Избранное
                    </Link> */}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Админка
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // <Button
              //   variant="outline"
              //   onClick={() => router.push("/auth/signin")}
              // >
              //   Войти
              // </Button>
              <></>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
