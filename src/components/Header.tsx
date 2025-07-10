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
  SheetClose, // Убедитесь, что SheetClose импортирован, если используется
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
  X,
  Loader2
} from 'lucide-react';
import { COMPANY_NAME_SHORT } from '@/data/constants';
// import { useCart } from '@/providers/cart'; // Импортируем хук корзины
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

const navItems = [
  { 
    href: '/catalog', 
    label: 'Каталог',
    // children: [
    //   { href: '/catalog/cables', label: 'Охранные системы' },
    // ]
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

// Функция форматирования цены (Medusa хранит цены в минорных единицах)
const formatPrice = (amount?: number, currencyCode: string = 'KZT'): string => {
  if (typeof amount !== 'number' || amount === null) {
    return 'N/A'; // Или другое значение по умолчанию
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100); // Делим на 100
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
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Для десктопного поиска

  // Используем useCart
//  const { cart, totalItems, isLoading: isCartLoading } = useCart();

  const { data: session, status: nextAuthStatus } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    localStorage.removeItem('medusa_jwt'); // Очищаем токен Medusa при выходе из NextAuth
    await signOut({ redirect: false });
    router.push("/"); 
  };

  const isLoadingSession = nextAuthStatus === "loading";
  const isAuthenticated = nextAuthStatus === "authenticated";
  const nextAuthUser = session?.user;
  const userFullName = nextAuthUser?.name;
  const userEmail = nextAuthUser?.email;
  // const avatarUrl = nextAuthUser?.image;

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
      setIsSearchOpen(false);
      if(openMobileMenu) setOpenMobileMenu(false);
    }
  };

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
              "flex items-center px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
                    className="block px-4 py-2 text-foreground hover:bg-accent hover:text-primary transition-colors duration-200"
                    onClick={() => { setIsDropdownOpen(false); if(onClose) onClose(); }}
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
          <DropdownMenu> {/* Используем DropdownMenu для мобильных подменю */}
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "justify-between text-base w-full mb-1 px-3 py-2 h-auto", // Увеличим padding для мобильных
                  isActive ? "text-primary bg-accent" : "text-foreground hover:bg-accent"
                )}
              >
                {item.label}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card w-[calc(100%-2rem)] ml-3"> {/* Ширина контента */}
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
            layoutId="underline" // Для красивой анимации подчеркивания при смене активного элемента
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
            initial="hidden"
            animate="visible"
            variants={underlineVariants}
          />
        )}
      </div>
    );
  };

  if (!mounted) return <header className="sticky top-0 z-50 h-16 sm:h-20 bg-card/80 border-b border-border"></header>; // Placeholder для избежания CLS

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

          <nav className="hidden lg:flex space-x-1 justify-end"> 
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
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
                
                <ScrollArea className="h-[calc(100vh-140px)]"> {/* Регулируем высоту для прокрутки */}
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

