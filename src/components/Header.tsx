'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
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
  X
} from 'lucide-react';
import { COMPANY_NAME_SHORT } from '@/data/constants';

// Будем использовать для интеграции с Medusa.js
// import { useCart } from 'medusa-react';
// import { useAccount } from '@/hooks/use-account';

// Для эмуляции данных от Medusa
interface CartData {
  items: any[];
  totalItems: number;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

const navItems = [
  { 
    href: '/catalog', 
    label: 'Каталог',
    children: [
      { href: '/catalog/cables', label: 'Кабели' },
      { href: '/catalog/connectors', label: 'Разъемы' },
      { href: '/catalog/accessories', label: 'Аксессуары' },
      { href: '/catalog/tools', label: 'Инструменты' },
    ]
  },
  { href: '/services', label: 'Услуги' },
  { href: '/about', label: 'О нас' },
  { href: '/contact', label: 'Контакты' },
];

const easeTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

// Анимация для подчеркивания активного элемента навигации
const underlineVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: '100%', opacity: 1, transition: { duration: 0.3 } }
};

// Анимация появления выпадающего меню
const dropdownVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

// Анимация badge для корзины
const badgeVariants = {
  initial: { scale: 0 },
  animate: { scale: 1, transition: { type: 'spring', stiffness: 400, damping: 17 } },
};

// Для типизации пропсов NavItem
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
  
  // Эмуляция данных от Medusa.js (заменить на реальные хуки)
  // const cart = useCart();
  // const { user, isLoading: userLoading } = useAccount();
  const [cartData, setCartData] = useState<CartData>({ items: [], totalItems: 0 });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Эмулируем загрузку данных от Medusa
  useEffect(() => {
    // Эмуляция задержки загрузки
    const timer = setTimeout(() => {
      setCartData({ items: [], totalItems: 2 });
      // Раскомментируйте для эмуляции авторизованного пользователя
      // setUserData({ id: '1', email: 'user@example.com', firstName: 'Иван', lastName: 'Петров' });
      setUserData(null);
      setUserLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Переключатель темы с анимацией
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Обработчик отправки формы поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Редирект на страницу поиска
      console.log(`Search for: ${searchQuery}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // Компонент элемента навигации
  const NavItem = ({ item, mobile = false, onClose }: NavItemProps) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
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
              "flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 outline-none",
              isActive 
                ? "text-primary" 
                : "text-foreground hover:text-primary"
            )}
            aria-expanded={isDropdownOpen}
          >
            {item.label}
            <ChevronDown className={cn(
              "ml-1 h-4 w-4 transition-transform duration-200",
              isDropdownOpen ? "rotate-180" : ""
            )} />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                className="absolute top-full left-0 mt-1 py-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={dropdownVariants}
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2 text-foreground hover:bg-accent/50 hover:text-primary transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {child.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
                  "justify-start text-base w-full mb-1",
                  isActive ? "text-primary bg-accent/30" : "text-foreground hover:bg-accent/20"
                )}
              >
                {item.label}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card w-full">
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
            "justify-start text-base w-full mb-1",
            isActive ? "text-primary bg-accent/30" : "text-foreground hover:bg-accent/20"
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
            "px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 outline-none",
            isActive
              ? "text-primary"
              : "text-foreground hover:text-primary"
          )}
        >
          {item.label}
        </Link>
        {(isActive || isHovered) && (
          <motion.div
            className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
            initial="hidden"
            animate="visible"
            variants={underlineVariants}
          />
        )}
      </div>
    );
  };

  // Для избежания мерцания при загрузке темы
  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={easeTransition}
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/teko-logo.svg"
              alt={COMPANY_NAME_SHORT}
              width={140}
              height={40}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>

          {/* Поисковая строка - только на больших экранах */}
          <div className="hidden md:flex items-center ml-6 mr-auto">
            <AnimatePresence mode="wait">
              {isSearchOpen ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                  onSubmit={handleSearchSubmit}
                >
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                >
                  <Search className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          {/* Навигация для Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Кнопки действий */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Поиск для мобильных */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Избранное */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
              asChild
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Избранное</span>
              </Link>
            </Button>

            {/* Корзина */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span className="sr-only">Корзина</span>
                  <AnimatePresence>
                    {cartData.totalItems > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <Badge variant="primary" className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs">
                          {cartData.totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-4">
                <DropdownMenuLabel className="font-medium text-lg border-b pb-2 mb-2">Корзина</DropdownMenuLabel>
                
                {cartData.totalItems > 0 ? (
                  <>
                    <div className="max-h-60 overflow-auto py-1">
                      {/* Здесь будут элементы корзины из Medusa */}
                      <div className="flex items-center gap-3 py-2 border-b border-border/50">
                        <div className="bg-accent/30 rounded h-16 w-16 flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Кабель HDMI 2.1</p>
                          <p className="text-xs text-muted-foreground">1 × 1 200 ₽</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 py-2 border-b border-border/50">
                        <div className="bg-accent/30 rounded h-16 w-16 flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">Разъем XLR</p>
                          <p className="text-xs text-muted-foreground">1 × 800 ₽</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-3 border-t border-border mt-1">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-foreground">Итого:</span>
                        <span className="text-base font-semibold text-foreground">2 000 ₽</span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <Link href="/cart">Корзина</Link>
                        </Button>
                        <Button asChild variant="primary" size="sm" className="flex-1">
                          <Link href="/checkout">Оформить</Link>
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Ваша корзина пуста</p>
                    <Button asChild variant="primary" className="mt-3">
                      <Link href="/catalog">Перейти в каталог</Link>
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Пользователь */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                >
                  {userLoading ? (
                    <Skeleton className="h-5 w-5 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span className="sr-only">Профиль</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {userData ? (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={userData.avatar} alt={userData.firstName || userData.email} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {userData.firstName?.[0] || userData.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}` : userData.email}
                        </p>
                        {userData.firstName && (
                          <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Мой аккаунт</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="flex items-center">
                        <Package className="mr-2 h-4 w-4" />
                        <span>Мои заказы</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Избранное</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Настройки</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-3 text-center">
                      <p className="text-sm text-muted-foreground mb-3">Войдите, чтобы получить доступ к своему аккаунту</p>
                      <Button asChild variant="primary" size="sm" className="w-full mb-2">
                        <Link href="/login">Войти</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href="/register">Регистрация</Link>
                      </Button>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Смена темы */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
              <span className="sr-only">Сменить тему</span>
            </Button>

            {/* Мобильное меню */}
            <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="lg:hidden w-full sm:w-80 p-0 border-l border-border">
                <SheetHeader className="p-4 border-b border-border bg-muted/30">
                  <SheetTitle className="text-left text-lg font-semibold text-foreground">
                    Меню
                  </SheetTitle>
                </SheetHeader>
                
                {/* Поиск в мобильном меню */}
                <div className="p-4 border-b border-border">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </form>
                </div>
                
                <div className="py-4 px-3 overflow-y-auto max-h-[calc(100vh-12rem)]">
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavItem key={item.href} item={item} mobile onClose={() => setOpenMobileMenu(false)} />
                    ))}
                  </nav>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="justify-start text-base w-full mb-1"
                      onClick={() => setOpenMobileMenu(false)}
                    >
                      <Link href="/wishlist">
                        <Heart className="mr-2 h-4 w-4" />
                        Избранное
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={toggleTheme}
                      className="justify-start text-base w-full mb-1"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Светлая тема
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Темная тема
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Полноэкранный поиск для мобильных */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4 lg:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Поиск</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-foreground hover:bg-accent/30"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <Button type="submit" variant="primary" className="mt-3 w-full">
                  Найти
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}