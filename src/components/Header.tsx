// src/components/Header.tsx - обновленный Header с новой корзиной
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  X,
  Loader2,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import { useCart } from '@/providers/cart';
import { Input } from './ui/input';
import { toast } from 'sonner';

const navItems = [
  { 
    href: '/catalog', 
    label: 'Каталог',
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

const underlineVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: { width: '100%', opacity: 1, transition: { duration: 0.3 } }
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -5 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 17 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.2 } }
};

// Компонент элемента корзины в выпадающем меню
const CartDropdownItem = ({ item }: { item: any }) => {
  const { updateItemQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      updateItemQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    setIsUpdating(true);
    try {
      removeItem(item.id);
      toast.success('Товар удален из корзины');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
        isUpdating ? 'opacity-50' : ''
      }`}
    >
      {/* Изображение товара */}
      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={48}
            height={48}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <Package className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* Информация о товаре */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
          {item.title}
        </h4>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-primary">
            {(item.price * item.quantity).toLocaleString('ru-RU')} ₸
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUpdating}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Управление количеством */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            className="h-6 w-6 p-0"
          >
            <Minus className="w-3 h-3" />
          </Button>
          
          <span className="w-8 text-center text-sm font-medium">
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isUpdating || (item.maxQuantity && item.quantity >= item.maxQuantity)}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
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
  
  const [searchQuery, setSearchQuery] = useState('');

  // Используем новый useCart
  const { cart, totalItems, totalPrice, isLoading: isCartLoading, isEmpty } = useCart();

  const { data: session, status: nextAuthStatus } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/"); 
  };

  const isLoadingSession = nextAuthStatus === "loading";
  const isAuthenticated = nextAuthStatus === "authenticated";
  const nextAuthUser = session?.user;
  const userFullName = nextAuthUser?.name;
  const userEmail = nextAuthUser?.email;
  const avatarUrl = nextAuthUser?.image;

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

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      if(openMobileMenu) setOpenMobileMenu(false);
    }
  };

  const NavItem = ({ item, mobile = false, onClose }: NavItemProps) => {
    const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const [isHovered, setIsHovered] = useState(false);

    if (mobile) {
      return (
        <Button 
          key={item.href} 
          variant="ghost" 
          asChild 
          className={cn(
            "justify-start text-base w-full mb-1 px-3 py-2 h-auto",
            isActive ? "text-primary bg-accent" : "text-foreground hover:bg-accent"
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
            isActive
              ? "text-primary"
              : "text-foreground hover:text-primary"
          )}
        >
          {item.label}
        </Link>
        {(isActive || isHovered) && (
          <motion.div
            layoutId="underline"
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            initial="hidden"
            animate="visible"
            variants={underlineVariants}
          />
        )}
      </div>
    );
  };

  if (!mounted) return <header className="sticky top-0 z-50 h-16 sm:h-20 bg-card/80 border-b border-border"></header>;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={easeTransition}
      className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-sm"
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
              priority
            />
            <Image
              src="/images/logos/asia-ntb/Asia-NTB-logo-eng-dark.svg"
              alt={COMPANY_NAME_SHORT}
              width={140}
              height={40}
              className="hidden dark:block h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-1 mx-auto">
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Корзина с выпадающим меню */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                  aria-label="Корзина"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.div
                        className="absolute -top-1 -right-1"
                        variants={badgeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                      >
                        <Badge variant="destructive" className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs">
                          {totalItems > 99 ? '99+' : totalItems}
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 bg-card border-border shadow-xl">
                <DropdownMenuLabel className="font-medium text-lg px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <span>Корзина</span>
                    {totalItems > 0 && (
                      <Badge variant="secondary">
                        {totalItems}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                {isCartLoading ? (
                  <div className="py-10 text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">Загрузка корзины...</p>
                  </div>
                ) : isEmpty ? (
                  <div className="py-10 text-center px-4">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Ваша корзина пуста</p>
                    <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
                      <Link href="/catalog">Перейти в каталог</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="max-h-80 p-4">
                      <div className="space-y-3">
                        <AnimatePresence>
                          {cart?.items.map((item) => (
                            <CartDropdownItem key={item.id} item={item} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                    
                    <div className="p-4 border-t border-border">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-base text-foreground font-medium">Итого:</span>
                        <span className="text-lg font-bold text-foreground">
                          {totalPrice.toLocaleString('ru-RU')} ₸
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <Button asChild variant="outline" size="lg" className="flex-1">
                          <Link href="/cart">В корзину</Link>
                        </Button>
                        <Button asChild variant="default" size="lg" className="flex-1 bg-primary hover:bg-primary/90">
                          <Link href="/checkout">Оформить</Link>
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Профиль пользователя */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
                  aria-label="Профиль пользователя"
                >
                  {isLoadingSession ? (
                    <Skeleton className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 bg-card border-border shadow-xl">
                {isAuthenticated && nextAuthUser ? (
                  <>
                    <DropdownMenuLabel className="flex items-center gap-3 px-3 py-2.5">
                      <Avatar className="h-10 w-10">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt={userFullName || userEmail || "User"} />}
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                          {getInitials(userFullName, userEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {userFullName || "Пользователь"}
                        </p>
                        {userEmail && (
                          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Мой аккаунт</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders" className="flex items-center cursor-pointer">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Мои заказы</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-3 space-y-2">
                     <p className="text-sm text-muted-foreground text-center mb-3">
                        Войдите или создайте аккаунт
                      </p>
                    <Button asChild variant="default" size="sm" className="w-full bg-primary hover:bg-primary/90">
                      <Link href="/auth/signin">Войти</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/auth/signup">Регистрация</Link>
                    </Button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Переключатель темы */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-accent/30 hover:text-primary transition-colors"
              aria-label="Сменить тему"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: theme === 'dark' ? 20 : -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: theme === 'dark' ? -20 : 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </Button>

            {/* Мобильное меню */}
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
              <SheetContent side="right" className="lg:hidden w-full max-w-xs sm:max-w-sm p-0 border-l border-border bg-card">
                <SheetHeader className="p-4 border-b border-border bg-muted/30">
                  <SheetClose asChild>
                    <div className="flex justify-between items-center">
                       <SheetTitle className="text-left text-lg font-semibold text-foreground">
                        Меню
                      </SheetTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </SheetClose>
                </SheetHeader>
                
                <div className="p-4 border-b border-border">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Input
                      type="text"
                      placeholder="Поиск товаров..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </form>
                </div>
                
                <ScrollArea className="h-[calc(100vh-140px)]">
                  <div className="py-4 px-3">
                    <nav className="flex flex-col gap-1">
                      {navItems.map((item) => (
                        <NavItem key={item.href} item={item} mobile onClose={() => setOpenMobileMenu(false)} />
                      ))}
                    </nav>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button 
                        variant="ghost" 
                        asChild 
                        className="justify-start text-base w-full mb-1 px-3 py-2 h-auto"
                        onClick={() => setOpenMobileMenu(false)}
                      >
                        <Link href="/wishlist">
                          <Heart className="mr-2 h-4 w-4" />
                          Избранное
                        </Link>
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.header>
  );
}